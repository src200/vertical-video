import React, { Component } from 'react';
import './Player.scss';
import '../resizer/Resizer.scss'
// import Resizer from '../resizer/Resizer';
import { Slider, Button } from 'antd';
import { Rnd } from 'react-rnd';
const cv = window.cv;

class Player extends Component {
    constructor(props) {
        super(props);

        this.state = {
            video: {
                framesPerSec: 30,
                percentPlayed: 0.0,
                duration: 0.0, // sec
                currentAt: 0.0 // sec
            },
            coordinates: {
                canvas: {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                }
            },
            previewFrameGeometry: {
                sx: 0,
                sy: 0,
                sWidth: 100,
                sHeight: 100
            },
            resizerOpts: {
                className: 'resizer',
                minWidth: 100,
                minHeight: 100,
                bounds: 'parent',
                resizeHandleClasses: {
                    bottom: 'bottom',
                    bottomLeft: 'bottom-left',
                    bottomRight: 'bottom-right',
                    left: 'left',
                    right: 'right',
                    top: 'top',
                    topLeft: 'top-left',
                    topRight: 'top-right'
                },
                onDrag: (e, d) => {
                    this.setState({
                        previewFrameGeometry: {
                            sx: d.x,
                            sy: d.y,
                            sWidth: e.target.offsetWidth,
                            sHeight: e.target.offsetHeight
                        }
                    });
                },
                onResize: (e, direction, ref, delta, position) => {
                    this.setState({
                        previewFrameGeometry: {
                            sx: position.x,
                            sy: position.y,
                            sWidth: ref.offsetWidth,
                            sHeight: ref.offsetHeight
                        }
                    });
                }
            }
        };

        this.reqAnimeId = '';

        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
        this.seek = this.seek.bind(this);

        // create refs to store the video and canvas DOM element
        this.videoEl = React.createRef();
        this.canvasEl = React.createRef();
        this.previewCanvasEl = React.createRef();
    }

    play() {
        this.videoEl.current.play();
    }

    pause() {
        this.videoEl.current.pause();
    }

    seek(seekTo) {
        this.videoEl.current.currentTime = seekTo;
    }

    componentDidMount() {
        const ctx = this.canvasEl.current.getContext('2d');
        const previewCtx = this.previewCanvasEl.current.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        let imageData;

        // // update co-ordinates of canvas element realtive to viewport
        // this.setState({
        //     canvasCoordinates: {
        //         x: this.canvasEl.current.getBoundingClientRect().left,
        //         y: this.canvasEl.current.getBoundingClientRect().top
        //     }
        // });

        const startOpticFlow = () => {
            let video = this.videoEl.current;
            let cap = new cv.VideoCapture(video);

            // take first frame of the video
            let frame1 = new cv.Mat(video.height, video.width, cv.CV_8UC4);
            cap.read(frame1);

            let prvs = new cv.Mat();
            cv.cvtColor(frame1, prvs, cv.COLOR_RGBA2GRAY);
            frame1.delete();
            let hsv = new cv.Mat();
            let hsv0 = new cv.Mat(video.height, video.width, cv.CV_8UC1);
            let hsv1 = new cv.Mat(video.height, video.width, cv.CV_8UC1, new cv.Scalar(255));
            let hsv2 = new cv.Mat(video.height, video.width, cv.CV_8UC1);
            let hsvVec = new cv.MatVector();
            hsvVec.push_back(hsv0); hsvVec.push_back(hsv1); hsvVec.push_back(hsv2);

            let frame2 = new cv.Mat(video.height, video.width, cv.CV_8UC4);
            let next = new cv.Mat(video.height, video.width, cv.CV_8UC1);
            let flow = new cv.Mat(video.height, video.width, cv.CV_32FC2);
            let flowVec = new cv.MatVector();
            let mag = new cv.Mat(video.height, video.width, cv.CV_32FC1);
            let ang = new cv.Mat(video.height, video.width, cv.CV_32FC1);
            let rgb = new cv.Mat(video.height, video.width, cv.CV_8UC3);

            const FPS = 30;
            function processVideo() {
                try {
                    // if (!streaming) {
                    //     // clean and stop.
                    //     prvs.delete(); hsv.delete(); hsv0.delete(); hsv1.delete(); hsv2.delete();
                    //     hsvVec.delete(); frame2.delete(); flow.delete(); flowVec.delete(); next.delete();
                    //     mag.delete(); ang.delete(); rgb.delete();
                    //     return;
                    // }
                    let begin = Date.now();

                    // start processing.
                    cap.read(frame2);
                    cv.cvtColor(frame2, next, cv.COLOR_RGBA2GRAY);
                    cv.calcOpticalFlowFarneback(prvs, next, flow, 0.5, 3, 15, 3, 5, 1.2, 0);
                    cv.split(flow, flowVec);
                    let u = flowVec.get(0);
                    let v = flowVec.get(1);
                    cv.cartToPolar(u, v, mag, ang);
                    u.delete(); v.delete();
                    ang.convertTo(hsv0, cv.CV_8UC1, 180 / Math.PI / 2);
                    cv.normalize(mag, hsv2, 0, 255, cv.NORM_MINMAX, cv.CV_8UC1);
                    cv.merge(hsvVec, hsv);
                    cv.cvtColor(hsv, rgb, cv.COLOR_HSV2RGB);
                    cv.imshow('canvasOutput', rgb);
                    next.copyTo(prvs);

                    // schedule the next one.
                    let delay = 1000 / FPS - (Date.now() - begin);
                    setTimeout(processVideo, delay);
                } catch (err) {
                    console.error(err);
                }
            };

            // schedule the first one.
            window.setTimeout(processVideo, 0);
        }

        const drawFrames = (videoDOM) => {
            if (!videoDOM.paused && !videoDOM.ended) {
                ctx.drawImage(videoDOM, 0, 0, ctx.canvas.width, ctx.canvas.height);
                drawPreviewFrames();
                window.requestAnimationFrame(() => drawFrames(videoDOM));
            }
        }

        const drawPreviewFrames = () => {
            imageData = ctx.getImageData(this.state.previewFrameGeometry.sx,
                this.state.previewFrameGeometry.sy, this.state.previewFrameGeometry.sWidth,
                this.state.previewFrameGeometry.sHeight);

            previewCtx.putImageData(imageData, 0, 0);
        }

        // {x,y} can be position object or size object 
        const updateResizerDimensions = (geometry, x, y) => {
            if (geometry === 'position') {
                this.rnd.updatePosition({ x: parseInt(x), y: parseInt(y) });
            }

            if (geometry === 'size') {
                this.rnd.updateSize({ width: x, height: y });
            }
        }

        // event triggered on playing video
        this.videoEl.current.addEventListener('play', (e) => {
            drawFrames(this.videoEl.current);
            startOpticFlow();
        });

        // event triggered while playing video
        this.videoEl.current.addEventListener('timeupdate', (e) => {
            this.setState({
                video: {
                    percentPlayed: ((this.videoEl.current.currentTime / this.videoEl.current.duration) * 100).toFixed(2),
                    duration: this.videoEl.current.duration.toFixed(2),
                    currentAt: this.videoEl.current.currentTime.toFixed(2)
                }
            });
        });

        // event is fired on first frame has been loaded.
        this.videoEl.current.addEventListener('loadeddata', function (e) {
            // draw initial frame on canvas            
            this.play();
            setTimeout(() => {
                this.pause();
            }, 200);
        });
    }

    componentWillUnmount() {
        if (this.reqAnimeId)
            cancelAnimationFrame(this.reqAnimeId);
    }

    render() {
        return (
            <div className="player">
                <video width="500" height="500" src={this.props.videoSrc} ref={this.videoEl} style={{ display: 'none' }}>
                    Sorry, your browser doesn't support embedded videos.
                </video>
                <div className="canvas-container">
                    <canvas ref={this.canvasEl} width="640" height="480"></canvas>
                    <Rnd ref={c => { this.rnd = c; }} {...this.state.resizerOpts}></Rnd>
                    <div>{this.state.video.currentAt} / {this.state.video.duration}</div>
                    <Slider step={0.01} className="canvas-timeline"
                        max={parseFloat(this.state.video.duration)}
                        value={parseFloat(this.state.video.currentAt)}
                        onChange={this.seek.bind(this)} />
                    <Button type="primary" onClick={this.play}>Play</Button>
                    <Button type="primary" onClick={this.pause}>Pause</Button>
                </div>
                <div className="preview-container">
                    <canvas ref={this.previewCanvasEl} width={this.state.previewFrameGeometry.sWidth} height={this.state.previewFrameGeometry.sHeight}></canvas>
                    <canvas id="canvasOutput"></canvas>
                </div>

            </div>
        )
    }
}

export default Player;
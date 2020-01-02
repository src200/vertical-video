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
            canvas: {
                x: 0,
                y: 0,
                width: 640,
                height: 480
            },
            previewFrameGeometry: {
                sx: 0,
                sy: 0,
                sWidth: 270,
                sHeight: 480
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
        this.initVideoProcessing();
    }

    pause() {
        this.videoEl.current.pause();
    }

    seek(seekTo) {
        this.videoEl.current.currentTime = seekTo;
    }

    initVideoProcessing() {
        let video = this.videoEl.current;
        let cap = new cv.VideoCapture(video);

        // parameters for ShiTomasi corner detection
        let [maxCorners, qualityLevel, minDistance, blockSize] = [400, 0.01, 3, 3];

        // take first frame and find corners in it
        let srcFrame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let grayFrame = new cv.Mat(video.height, video.width, cv.CV_8UC4);

        let corners = new cv.Mat();
        let goodFeatures = [];

        let begin, sum, point, avgX, prevX;
        const FPS = 24;
        const processVideo = () => {
            try {
                if (video.paused) {
                    // clean and stop.
                    // src.delete(); dst.delete();
                    return;
                }

                begin = Date.now();
                cap.read(srcFrame);
                cv.cvtColor(srcFrame, grayFrame, cv.COLOR_RGBA2GRAY);
                cv.goodFeaturesToTrack(grayFrame, corners, maxCorners, qualityLevel, minDistance, new cv.Mat(), blockSize);

                sum = 0;
                goodFeatures = [];
                for (var i = 0; i < corners.rows; i++) {
                    point = new cv.Point(corners.data32F[i * 2], corners.data32F[(i * 2) + 1]);
                    goodFeatures.push(point);
                    sum = sum + (point.x - 130);
                }

                avgX = sum / corners.rows;

                this.setState({
                    previewFrameGeometry: {
                        sx: avgX ? avgX : 0,
                        sy: 0,
                        sWidth: video.videoHeight * (9/16),
                        sHeight: video.videoHeight
                    }
                });

                for (let i = 0; i < goodFeatures.length; i++) {
                    cv.circle(srcFrame, goodFeatures[i], 3, new cv.Scalar(10, 200, 10), -1);
                }

                cv.imshow('canvasOutput', srcFrame);
                prevX = avgX;

                // schedule the next one.
                let delay = 1000 / FPS - (Date.now() - begin);
                window.setTimeout(processVideo, delay);
            } catch (err) {
                console.error(err);
            }
        };

        // schedule the first one.
        window.setTimeout(processVideo, 0);
    }

    componentDidMount() {
        const ctx = this.canvasEl.current.getContext('2d');
        const previewCtx = this.previewCanvasEl.current.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        let imageData;

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

        // event triggered on playing video
        this.videoEl.current.addEventListener('play', (e) => {
            drawFrames(this.videoEl.current);
            this.initVideoProcessing();
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
        this.videoEl.current.addEventListener('loadeddata', (e) => {
            // draw initial frame on canvas            
            // this.play();
            // setTimeout(() => {
            //     this.pause();
            // }, 200);
        });
    }

    componentWillUnmount() {
        if (this.reqAnimeId)
            cancelAnimationFrame(this.reqAnimeId);
    }

    render() {
        return (
            <div className="player">
                <video width="640" height="480" controls src={this.props.videoSrc} ref={this.videoEl} >
                    Sorry, your browser doesn't support embedded videos.
                </video>
                <div className="canvas-container">
                    <canvas ref={this.canvasEl} width={this.state.canvas.width} height={this.state.canvas.height} style={{ display: 'none' }}></canvas>
                    {/* <Rnd ref={c => { this.rnd = c; }} {...this.state.resizerOpts}></Rnd>
                    <div>{this.state.video.currentAt} / {this.state.video.duration}</div>
                    <Slider step={0.01} className="canvas-timeline"
                        max={parseFloat(this.state.video.duration)}
                        value={parseFloat(this.state.video.currentAt)}
                        onChange={this.seek.bind(this)} />
                    <Button type="primary" onClick={this.play}>Play</Button>
                    <Button type="primary" onClick={this.pause}>Pause</Button> */}
                </div>
                <div className="preview-container">
                    <canvas ref={this.previewCanvasEl} width={this.state.previewFrameGeometry.sWidth} height={this.state.previewFrameGeometry.sHeight}></canvas>
                </div>
                <canvas id="canvasOutput"></canvas>
            </div>
        )
    }
}

export default Player;
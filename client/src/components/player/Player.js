import React, { Component } from 'react';
import './Player.scss';
import '../resizer/Resizer.scss'
// import Resizer from '../resizer/Resizer';
import { Slider, Button } from 'antd';
import { Rnd } from 'react-rnd';
const cv = window.cv;
const KalmanFilter = window.KalmanFilter;

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

    exportVideo(blob) {
        const vid = document.createElement('video');
        vid.src = URL.createObjectURL(blob);
        vid.controls = true;
        document.body.appendChild(vid);
        const a = document.createElement('a');
        a.download = 'output' + new Date() + '.mp4';
        a.href = vid.src;
        a.textContent = 'Download the video';
        document.body.appendChild(a);
    }

    startMediaRecord() {
        const chunks = []; // here we will store our recorded media chunks (Blobs)
        // every time the recorder has new data, we will store it in our array
        const stream = this.previewCanvasEl.current.captureStream(); // grab our canvas MediaStream
        const rec = new MediaRecorder(stream); // init the recorder

        rec.ondataavailable = e => chunks.push(e.data);
        // only when the recorder stops, we construct a complete Blob from all the chunks
        rec.onstop = e => this.exportVideo(new Blob(chunks, { type: 'video/mp4' }));
        // start recording
        rec.start();
    }

    detectSceneChange(currFrame, prevFrame) {
        let currVec = new cv.MatVector();
        currVec.push_back(currFrame);
        let prevVec = new cv.MatVector();
        prevVec.push_back(prevFrame);

        let currHist = new cv.Mat();
        let prevHist = new cv.Mat();

        cv.calcHist(currVec, [0], new cv.Mat(), currHist, [256], [0, 255], false);
        cv.calcHist(prevVec, [0], new cv.Mat(), prevHist, [256], [0, 255], false);

        let cmp = cv.compareHist(currHist, prevHist, cv.HISTCMP_BHATTACHARYYA);
        console.log(cmp)
    }

    initVideoProcessing() {
        let video = this.videoEl.current;
        let cap = new cv.VideoCapture(video);

        // parameters for ShiTomasi corner detection
        let [maxCorners, qualityLevel, minDistance, blockSize] = [3000, 0.01, 3, 3];

        // take first frame and find corners in it
        let srcFrame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let grayFrame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let prevFrame = new cv.Mat(video.height, video.width, cv.CV_8UC4);

        let corners = new cv.Mat();
        let goodFeatures = [];

        let begin, sum, point, avgX, prevX;
        const FPS = 24;
        // this.startMediaRecord(rec);
        const kf = new KalmanFilter({R: 0.01, Q: 4});
        const processVideo = () => {
            try {
                if (video.paused || video.ended) {
                    // clean and stop.
                    // src.delete(); dst.delete();
                    // rec.stop();
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
                    sum = sum + (point.x - 140);
                }

                avgX = sum / corners.rows;

                // this.setState({
                //     cutVideoAt: avgX ? avgX :prevX
                // });

                this.setState({
                    previewFrameGeometry: {
                        sx: kf.filter(avgX) ? kf.filter(avgX) : 0,
                        sy: 0,
                        sWidth: this.videoEl.current.height * (9 / 16),
                        sHeight: this.videoEl.current.height
                    }
                });

                // for (let i = 0; i < goodFeatures.length; i++) {
                //     cv.circle(srcFrame, goodFeatures[i], 3, new cv.Scalar(10, 200, 10), -1);
                // }

                // cv.imshow('canvasOutput', srcFrame);
                // this.detectSceneChange(srcFrame, prevFrame);
                prevX = avgX;
                console.log('x', avgX);
                console.log('kalman x:', kf.filter(avgX));
                // console.log('t:', begin);

                prevFrame = srcFrame;

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



        this.videoEl.current.addEventListener('scenechange', (e) => {
            console.log('New scene change detected at', e.timeStamp);
            console.log('avg :', this.state.cutVideoAt);
            this.setState({
                previewFrameGeometry: {
                    sx: this.state.cutVideoAt ? this.state.cutVideoAt : 0,
                    sy: 0,
                    sWidth: this.videoEl.current.height * (9 / 16),
                    sHeight: this.videoEl.current.height
                }
            });
        });

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
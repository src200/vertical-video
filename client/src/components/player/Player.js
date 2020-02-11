import React, { Component } from 'react';
import { Row, Col, Slider, Button } from 'antd';
import { connect } from 'react-redux';
import './Player.scss';
import Timeline from '../timeline/Timeline';

const cv = window.cv;
const Scd = window.Scd;
const KalmanFilter = window.KalmanFilter;

const mapStateToProps = (state) => {

}

const mapDispatchToProps = (dispatch) => {

}

class Player extends Component {
    constructor(props) {
        super(props);

        this.state = {
            video: {
                isVideoPlaying: false,
                currentTime: 0,
                duration: 0,
                percentPlayed: 0
            },
            previewFrame: {
                sx: 0,
                sy: 0,
                sWidth: 270, // TODO
                sHeight: 480
            },
            frameBuffer: []
        };

        // frame constructor
        this.frame = {
            num: 0,            // frame number,
            src: '',           // src of frame( from video)
            sx: 0,             // x value of src image
            sy: 0,             // y value of src image
            dx: 0,             // x value of destination canvas
            dy: 0,             // y value of destination canvas
            oh: 0,             // original height of video
            ow: 0,             // original width of video
            h: 0,              //  height of frame
            w: 0,              //  width of frame
            t: 0,              // time of frame in the video
            ar: 9 / 16,        // aspect ratio of frame( this could change in future for 1:1)
            isKeyFrame: false, // make true when scene detects
            srcVideoObject: '' // original src
        }

        this.reqAnimeId = '';

        // create refs to store the video and canvas DOM element
        this.videoEl = React.createRef();
        this.canvasEl = React.createRef();
        this.previewCanvasEl = React.createRef();
        this.updatePosition = this.updatePosition.bind(this);
        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
        this.seek = this.seek.bind(this);
    }

    play(){
        this.videoEl.current.play();
    }

    pause() {
        this.videoEl.current.pause();
    }

    seek(value) {
        this.videoEl.current.currentTime = value;
    }

    initVideoProcessing() {
        let video = this.videoEl.current;
        let cap = new cv.VideoCapture(video);

        // parameters for ShiTomasi corner detection
        let [maxCorners, qualityLevel, minDistance, blockSize] = [1000, 0.001, 3, 3];

        // take first frame and find corners in it
        let srcFrame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let grayFrame = new cv.Mat(video.height, video.width, cv.CV_8UC4);

        let corners = new cv.Mat();
        let goodFeatures = [];

        let begin, sum, point, avgX;
        const FPS = 24;
        const kf = new KalmanFilter({ R: 0.01, Q: 4 });

        const processVideo = () => {
            try {
                if (video.paused || video.ended) {
                    // clean and stop.
                    // src.delete(); dst.delete();
                    // record.stop();
                    // record.onstop = e => this.exportVideo(new Blob(chunks, { type: 'video/mp4' }));
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
                    sum = sum + (point.x - 135);
                }

                avgX = sum / corners.rows;

                this.setState({
                    previewFrame: {
                        sx: avgX ? kf.filter(avgX) : 0,
                        sy: 0,
                        sWidth: this.videoEl.current.height * (9 / 16),
                        sHeight: this.videoEl.current.height
                    }
                });

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

    // init scenedetection(pixel based)
    initSceneDetection() {
        const scd = Scd(this.videoEl.current, {
            mode: 'PlaybackMode',
            minSceneDuration: 1,
            threshold: 10
        });

        return scd;
    }

    // update frame buffer
    updateFrameBuffer(video, isKeyFrame) {
        // create tmp canvas to copy pixels of src video object
        // this is to create new memory for every frame
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = video.width;
        tmpCanvas.height = video.height;
        const ctx = tmpCanvas.getContext('2d');
        ctx.scale(0.187, 0.208); // scale canvas to thumbnail dimensions
        ctx.drawImage(video, 0, 0, video.width, video.height);

        let newFrame = { ...this.frame };
        newFrame.num = this.state.frameBuffer.length;
        newFrame.srcVideoObject = video;
        newFrame.src = ctx.getImageData(0, 0, video.width, video.height);
        newFrame.x = 0;
        newFrame.y = 0;
        newFrame.sx = this.state.previewFrame.sx;
        newFrame.sy = this.state.previewFrame.sy;
        newFrame.oh = video.videoHeight;
        newFrame.ow = video.videoWidth;
        newFrame.h = 100;
        newFrame.w = 120;
        newFrame.t = video.currentTime;
        newFrame.ar = 9 / 16;
        newFrame.isKeyFrame = isKeyFrame ? isKeyFrame : false;

        this.setState(prevState => ({
            frameBuffer: [...prevState.frameBuffer, newFrame]
        }));
    }

    // update position of salient points rectangle
    // this values are lifter from canvas -> timleine -> player component
    updatePosition(rect, frameNumber) {
        const frameBuffer = this.state.frameBuffer;
        frameBuffer[frameNumber].sx = rect.x;
        frameBuffer[frameNumber].sy = rect.y;
        this.setState({ frameBuffer: [...frameBuffer] }, () => {
            console.log(this.state.frameBuffer[frameNumber]);
        });
    }

    componentDidMount() {
        const ctx = this.canvasEl.current.getContext('2d');
        const previewCtx = this.previewCanvasEl.current.getContext('2d');
        let imageData;
        let scd = {};

        // draw frames on hidden canvas for collecting salient feature points
        const drawFrames = (video) => {
            if (!video.paused && !video.ended) {
                ctx.drawImage(video, 0, 0, ctx.canvas.width, ctx.canvas.height);
                drawPreviewFrames();
                this.updateFrameBuffer(video);
                window.requestAnimationFrame(() => drawFrames(video));
            }
        }

        // preview canvas of actual cropped video
        const drawPreviewFrames = () => {
            imageData = ctx.getImageData(this.state.previewFrame.sx,
                this.state.previewFrame.sy, this.state.previewFrame.sWidth,
                this.state.previewFrame.sHeight);

            previewCtx.putImageData(imageData, 0, 0);
        }

        // event triggered on playing video
        this.videoEl.current.addEventListener('play', (e) => {
            const video = e.target;
            // draw frames on temp canvas to find salient features
            drawFrames(video);

            // init video processing using opencv
            this.initVideoProcessing();

            // start scene detection
            scd.start();

            if (video.currentTime !== 0) {
                this.setState({
                    video: {
                        ...this.state.video,
                        isVideoPlaying: true,
                        currentTime: video.currentTime,
                        percentPlayed: (video.currentTime / video.duration) * 100
                    }
                });
            }
        });

        // event triggered on pausing video
        this.videoEl.current.addEventListener('pause', (e) => {
            this.setState({
                video: {
                    ...this.state.video,
                    isVideoPlaying: false
                }
            });
        });

        // event triggered while playing video
        this.videoEl.current.addEventListener('timeupdate', (e) => {
            const video = e.target;

            if (video.currentTime !== 0) {
                this.setState({
                    video: {
                        ...this.state.video,
                        isVideoPlaying: true,
                        currentTime: video.currentTime,
                        percentPlayed: (video.currentTime / video.duration) * 100
                    }
                });
            }
        });

        // event triggered when new video is selected
        this.videoEl.current.addEventListener('durationchange', (e) => {
            const video = e.target;

            // reset video frames on choosing another video
            this.setState({
                frameBuffer: []
            });

            this.setState({
                video: {
                    ...this.state.video,
                    currentTime: 0,
                    duration: video.duration
                }
            });

            // start scene detection
            scd = this.initSceneDetection();
        });

        // event is fired when video is ready to play.
        this.videoEl.current.addEventListener('canplay', (e) => {

        });

        // event is fired when scene is detected.
        this.videoEl.current.addEventListener('scenechange', (e) => {
            this.updateFrameBuffer(e.target, true);
        });
    }

    componentWillUnmount() {
        if (this.reqAnimeId)
            cancelAnimationFrame(this.reqAnimeId);
    }

    render() {
        return (
            <div className="player">
                <Row>
                    <Col span={15}>
                        <div className="video-container">
                            <video width="640" height="480" src={this.props.videoSrc} ref={this.videoEl} >
                                Sorry, your browser doesn't support embedded videos.
                            </video>
                        </div>
                        <div className="canvas-container">
                            <canvas ref={this.canvasEl} width="640" height="480" style={{ display: 'none' }}></canvas>
                        </div>
                    </Col>
                    <Col span={9} align="right">
                        <div className="preview-container">
                            <canvas ref={this.previewCanvasEl} width={this.state.previewFrame.sWidth} height={this.state.previewFrame.sHeight}></canvas>
                        </div>
                        {/* <canvas id="canvasOutput"></canvas> */}
                    </Col>
                </Row>
                <Row>
                    <Col span={24} className="time-metadata">
                        <Row type="flex" justify="space-around" align="middle">
                            <Col span={1} className="time">
                                {this.state.video.isVideoPlaying ? <Button shape="circle" icon="pause-circle" onClick={this.pause}></Button> : <Button disabled={this.state.video.duration<=0} shape="circle" icon="play-circle" onClick={this.play}></Button>}
                            </Col>
                            <Col span={2} className="info">
                                {this.state.video.currentTime.toFixed(2)}/{this.state.video.duration.toFixed(2)}
                            </Col>
                            <Col span={20} className="progress">
                                <Slider step={0.0001}
                                    min={0}
                                    max={this.state.video.duration}
                                    value={this.state.video.currentTime}
                                    disabled={!this.state.video.isVideoPlaying}
                                    onChange={this.seek}
                                    tooltipVisible={false}
                                />
                            </Col>
                        </Row>
                    </Col>
                    <Col span={24}>
                        <Timeline frames={this.state.frameBuffer} updatePosition={this.updatePosition}></Timeline>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Player);
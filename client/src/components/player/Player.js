import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Slider, Button } from 'antd';

import './Player.scss';
import Timeline from '../timeline/Timeline';

const cv = window.cv;
const Scd = window.Scd;
const KalmanFilter = window.KalmanFilter;

const Player = (props) => {
    const [video, setVideo] = useState({
        isVideoPlaying: false,
        currentTime: 0,
        duration: 0,
        percentPlayed: 0
    });

    const [previewFrame, setPreviewFrame] = useState({
        sx: 0,
        sy: 0,
        sWidth: 270,
        sHeight: 480
    });

    const [frameBuffer, setFrameBuffer] = useState([]);

    // frame constructor
    const frame = {
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

    let scd, reqAnimeId = '';

    // create refs to store the video and canvas DOM element
    let videoEl = useRef(null);
    let canvasEl = useRef(null);
    let previewCanvasEl = useRef(null);

    const play = () => {
        videoEl.play();
    }

    const pause = () => {
        videoEl.pause();
    }

    const seek = (value) => {
        videoEl.currentTime = value;
    }

    const initVideoProcessing = () => {
        let video = videoEl;
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

                setPreviewFrame({
                    sx: avgX ? kf.filter(avgX) : 0,
                    sy: 0,
                    sWidth: videoEl.height * (9 / 16),
                    sHeight: videoEl.height
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
    const initSceneDetection = () => {
        const scd = Scd(videoEl, {
            mode: 'PlaybackMode',
            minSceneDuration: 1,
            threshold: 10
        });

        return scd;
    };

    // update frame buffer
    const updateFrameBuffer = (video, isKeyFrame) => {
        // create tmp canvas to copy pixels of src video object
        // this is to create new memory for every frame
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = video.width;
        tmpCanvas.height = video.height;
        const ctx = tmpCanvas.getContext('2d');
        ctx.scale(0.187, 0.208); // scale canvas to thumbnail dimensions
        ctx.drawImage(video, 0, 0, video.width, video.height);

        let newFrame = { ...frame };
        newFrame.num = frameBuffer.length;
        newFrame.srcVideoObject = video;
        newFrame.src = ctx.getImageData(0, 0, video.width, video.height);
        newFrame.x = 0;
        newFrame.y = 0;
        newFrame.sx = previewFrame.sx;
        newFrame.sy = previewFrame.sy;
        newFrame.oh = video.videoHeight;
        newFrame.ow = video.videoWidth;
        newFrame.h = 100;
        newFrame.w = 120;
        newFrame.t = video.currentTime;
        newFrame.ar = 9 / 16;
        newFrame.isKeyFrame = isKeyFrame ? isKeyFrame : false;
        setFrameBuffer(frameBuffer => frameBuffer.concat(newFrame));
    }

    // update position of salient points rectangle
    // this values are lifter from canvas -> timleine -> player component
    const updatePosition = (rect, frameNumber) => {
        frameBuffer[frameNumber].sx = rect.x;
        frameBuffer[frameNumber].sy = rect.y;
        setFrameBuffer([...frameBuffer]);
    };

    useEffect(() => {
        canvasEl = canvasEl.current;
        videoEl = videoEl.current;
        previewCanvasEl = previewCanvasEl.current;

        const ctx = canvasEl.getContext('2d');
        const previewCtx = previewCanvasEl.getContext('2d');
        let imageData;

        // draw frames on hidden canvas for collecting salient feature points
        const drawFrames = (video) => {
            if (!video.paused && !video.ended) {
                ctx.drawImage(video, 0, 0, ctx.canvas.width, ctx.canvas.height);
                drawPreviewFrames();
                updateFrameBuffer(video);
                window.requestAnimationFrame(() => drawFrames(video));
            }
        }

        // preview canvas of actual cropped video
        const drawPreviewFrames = () => {
            imageData = ctx.getImageData(previewFrame.sx,
                previewFrame.sy, previewFrame.sWidth,
                previewFrame.sHeight);

            previewCtx.putImageData(imageData, 0, 0);
        }

        // event triggered on playing video
        videoEl.addEventListener('play', (e) => {
            // draw frames on temp canvas to find salient features
            drawFrames(e.target);

            // init video processing using opencv
            initVideoProcessing();

            // init scene detection
            scd.start();

            if (video.currentTime !== 0) {
                setVideo(video => {
                    video = {
                        ...video,
                        isVideoPlaying: true,
                        currentTime: e.target.currentTime,
                        percentPlayed: (e.target.currentTime / e.target.duration) * 100
                    }
                });
            }
        });

        // event triggered on pausing video
        videoEl.addEventListener('pause', (e) => {
            setVideo(video => {
                video = {
                    ...video,
                    isVideoPlaying: false
                }
            });
        });

        // event triggered while playing video
        videoEl.addEventListener('timeupdate', (e) => {
            if (e.target.currentTime !== 0) {
                setVideo(video => {
                    video = {
                        ...video,
                        isVideoPlaying: true,
                        currentTime: e.target.currentTime,
                        percentPlayed: (e.target.currentTime / e.target.duration) * 100
                    }
                });
            }
        });

        // event triggered when new video is selected
        videoEl.addEventListener('durationchange', (e) => {
            // reset video frames on choosing another video
            setFrameBuffer([]);

            setVideo({
                ...video,
                currentTime: 0,
                duration: e.target.duration
            });

            debugger
            scd = initSceneDetection();
        });

        // event is fired when video is ready to play.
        videoEl.addEventListener('canplay', (e) => {

        });

        // event is fired when scene is detected.
        videoEl.addEventListener('scenechange', (e) => {
            updateFrameBuffer(e.target, true);
        });

        return () => {
            if (reqAnimeId) {
                cancelAnimationFrame(reqAnimeId);
            }
        }
    });

    return (
        <div className="player">
            <Row>
                <Col span={15}>
                    <div className="video-container">
                        <video width="640" height="480" src={props.videoSrc} ref={videoEl} >
                            Sorry, your browser doesn't support embedded videos.
                            </video>
                    </div>
                    <div className="canvas-container">
                        <canvas ref={canvasEl} width="640" height="480" style={{ display: 'none' }}></canvas>
                    </div>
                </Col>
                <Col span={9} align="right">
                    <div className="preview-container">
                        <canvas ref={previewCanvasEl} width={previewFrame.sWidth} height={previewFrame.sHeight}></canvas>
                    </div>
                    {/* <canvas id="canvasOutput"></canvas> */}
                </Col>
            </Row>
            <Row>
                <Col span={24} className="time-metadata">
                    <Row type="flex" justify="space-around" align="middle">
                        <Col span={1} className="time">
                            {video.isVideoPlaying ? <Button shape="circle" icon="pause-circle" onClick={pause}></Button> : <Button disabled={video.duration <= 0} shape="circle" icon="play-circle" onClick={play}></Button>}
                        </Col>
                        <Col span={2} className="info">
                            {video.currentTime.toFixed(2)}/{video.duration.toFixed(2)}
                        </Col>
                        <Col span={20} className="progress">
                            <Slider step={0.0001}
                                min={0}
                                max={video.duration}
                                value={video.currentTime}
                                disabled={!video.isVideoPlaying}
                                onChange={seek}
                                tooltipVisible={false}
                            />
                        </Col>
                    </Row>
                </Col>
                <Col span={24}>
                    <Timeline frames={frameBuffer} updatePosition={updatePosition}></Timeline>
                </Col>
            </Row>
        </div>
    )
}

export default Player;
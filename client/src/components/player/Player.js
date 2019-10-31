import React, { Component } from 'react';
import './Player.scss';
import { Slider, Button } from 'antd';

class Player extends Component {
    constructor(props) {
        super(props);
       
        this.state = {
            video: {
                framesPerSec: 30,
                percentPlayed: 0.0,
                duration: 0.0, // sec
                currentAt: 0.0 // sec
            }
        };

        this.reqAnimeId = '';

        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
        this.seek = this.seek.bind(this);
        this.mouseDownOnCanvas = this.mouseDownOnCanvas.bind(this);
        this.mouseMoveOnCanvas = this.mouseMoveOnCanvas.bind(this);
        this.mouseUpOnCanvas = this.mouseUpOnCanvas.bind(this);

        // create refs to store the video and canvas DOM element
        this.videoEl = React.createRef();
        this.canvasEl = React.createRef();
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

    mouseDownOnCanvas(e) {
        console.log(e.clientX, e.clientY);
    }

    mouseMoveOnCanvas(e) {
        // console.log(e.clientX, e.clientY);
    }

    mouseUpOnCanvas(e) {
        // console.log(e.clientX, e.clientY);
    }

    componentDidMount() {
        const ctx = this.canvasEl.current.getContext('2d');
        const drawFrames = (videoDOM) => {
            if (!videoDOM.paused && !videoDOM.ended) {
                ctx.drawImage(videoDOM, 0, 0, videoDOM.videoWidth, videoDOM.videoHeight,
                                        0, 0, ctx.canvas.width, ctx.canvas.height);
                window.requestAnimationFrame(() => drawFrames(videoDOM));
            }
        }

        // event triggered on playing video
        this.videoEl.current.addEventListener('play', (e) => {
            drawFrames(this.videoEl.current);
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
                <video src={this.props.videoSrc} ref={this.videoEl} style={{ display: 'none' }}>
                    Sorry, your browser doesn't support embedded videos.
                </video>
                <div className="canvas-container">
                    <canvas ref={this.canvasEl} width="640" height="480"
                            onMouseDown={this.mouseDownOnCanvas}
                            onMouseMove={this.mouseMoveOnCanvas}
                            onMouseUp={this.mouseUpOnCanvas}>
                    </canvas>
                </div>
                <span>{this.state.video.currentAt} / {this.state.video.duration}</span>
                <Slider step={0.01} className="canvas-timeline"
                    max={parseFloat(this.state.video.duration)}
                    value={parseFloat(this.state.video.currentAt)}
                    onChange={this.seek.bind(this)} />
                <Button type="primary" onClick={this.play}>Play</Button>
                <Button type="primary" onClick={this.pause}>Pause</Button>
            </div>
        )
    }
}

export default Player;
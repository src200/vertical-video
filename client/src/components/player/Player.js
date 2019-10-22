import React, { Component } from 'react';
import { Progress, Button } from 'antd';

class Player extends Component {
    constructor(props) {
        super(props);
        this.props = {
            videoSrc: ''
        };

        this.state = {
            video: {
                framesPerSec: 30,
                percentPlayed: 0,
                duration: 0,
                currentAt: 0
            }
        };


        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
        this.seek = this.seek.bind(this);

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

    seek(t) {
        // this.videoEl.current.fastSeek();
        debugger
    }

    componentDidMount() {
        const ctx = this.canvasEl.current.getContext('2d');

        // event triggered on playing video
        this.videoEl.current.addEventListener('play', (e) => {
            let videoDOM = this.videoEl.current;
            const loopOverFrames = () => {
                if (!videoDOM.paused && !videoDOM.ended) {
                    ctx.drawImage(videoDOM, 0, 0);
                    setTimeout(loopOverFrames, 1000 / this.state.video.framesPerSec);
                }
            }

            loopOverFrames();
        });

        // event triggered while playing video
        this.videoEl.current.addEventListener('timeupdate', (e) => {
            let percent = (this.videoEl.current.currentTime / this.videoEl.current.duration) * 100;
            this.setState({
                video: {
                    percentPlayed: percent,
                    duration: this.videoEl.current.duration,
                    currentAt: this.videoEl.current.currentTime
                }
            });
        });

        // event triggred on pausing video
        this.videoEl.current.addEventListener('pause', (e) => {

        });
    }

    componentWillUnmount() {
        this.videoEl.current.removeEventListener('play', (e) => {

        });

        this.videoEl.current.removeEventListener('pause', (e) => {

        });
    }

    render() {
        return (
            <div className="canavas-player">
                <video src={this.props.videoSrc} controls muted="true" ref={this.videoEl} style={{ display: 'none' }}>
                    Sorry, your browser doesn't support embedded videos.
                </video>
                <canvas height="400" width="400" ref={this.canvasEl}></canvas>
                <span>{this.state.video.currentAt} / {this.state.video.duration}</span>
                <Progress percent={this.state.video.percentPlayed} onClick={(e)=> {this.seek(e)}}/>
                <Button type="primary" onClick={this.play}>Play</Button>
                <Button type="primary" onClick={this.pause}>Pause</Button>
            </div>
        )
    }
}

export default Player;
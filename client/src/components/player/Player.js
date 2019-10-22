import React, { Component } from 'react';
import { Slider, Button } from 'antd';

class Player extends Component {
    constructor(props) {
        super(props);
        this.props = {
            videoSrc: ''
        };

        this.state = {
            video: {
                framesPerSec: 30,
                percentPlayed: 0.0,
                duration: 0.0, // sec
                currentAt: 0.0 // sec
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

    seek(seekTo) {
        this.videoEl.current.currentTime = seekTo;
    }

    componentDidMount() {
        const ctx = this.canvasEl.current.getContext('2d');

        // event triggered on playing video
        this.videoEl.current.addEventListener('play', (e) => {
            let videoDOM = this.videoEl.current;
            const loopOverFrames = () => {
                if (!videoDOM.paused && !videoDOM.ended) {
                    ctx.drawImage(videoDOM, 0, 0);
                    window.requestAnimationFrame(loopOverFrames);
                }
            }

            loopOverFrames();
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
                <video src={this.props.videoSrc} ref={this.videoEl} style={{ display: 'none' }}>
                    Sorry, your browser doesn't support embedded videos.
                </video>
                <canvas ref={this.canvasEl}></canvas>
                <span>{this.state.video.currentAt} / {this.state.video.duration}</span>
                <Slider step={0.01} 
                        max={parseFloat(this.state.video.duration)}
                        value={parseFloat(this.state.video.currentAt)}
                        onChange={this.seek.bind(this)}
                        onAfterChange={this.seek.bind(this)} />
                <Button type="primary" onClick={this.play}>Play</Button>
                <Button type="primary" onClick={this.pause}>Pause</Button>
            </div>
        )
    }
}

export default Player;
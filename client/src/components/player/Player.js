import React, { Component } from 'react';
import { Button } from 'antd';

class Player extends Component {

    constructor(props) {
        super(props);
        this.props = {
            videoSrc: ''
        };
        
        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);

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

    componentDidMount() {
        const ctx = this.canvasEl.current.getContext('2d');

        this.videoEl.current.addEventListener('play', (e) => {
            var $this = this.videoEl.current; //cache
            (function loop() {
                if (!$this.paused && !$this.ended) {
                    ctx.drawImage($this, 0, 0);
                    setTimeout(loop, 1000 / 30); // drawing at 30fps
                }
            })();
        });

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
                <video src={this.props.videoSrc} controls muted="true" ref={this.videoEl} style={{display: 'none'}}>
                    Sorry, your browser doesn't support embedded videos.
                </video>
                <canvas height="400" width="400" ref={this.canvasEl}></canvas>
                <Button type="primary" onClick={this.play}>Play</Button>
                <Button type="primary" onClick={this.pause}>Pause</Button>
            </div>
        )
    }
}

export default Player;
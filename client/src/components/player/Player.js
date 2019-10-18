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
    }

    play() {

    }

    pause() {

    }

    render() {
        return (
            <div className="canavas-player">
                <video src={this.props.videoSrc} controls muted="true" ref="videoElm">
                    Sorry, your browser doesn't support embedded videos.
            </video>
                <canvas height="400" width="400" ref="canavasElement"></canvas>
                <Button type="primary" onChange={this.play}>Play</Button>
                <Button type="primary" onChange={this.pause}>Pause</Button>
            </div>
        )
    }
}

export default Player;
import React, { Component } from 'react';
import './Timeline.scss';
import Canvas from '../canvas/Canvas';

class Timeline extends Component {
    constructor(props) {
        super(props);
      
        this.onVideoPlaying = this.onVideoPlaying.bind(this);
        this.onVideoChanged = this.onVideoChanged.bind(this);
        this.onSceneDetected = this.onSceneDetected.bind(this);
    }

    onVideoPlaying(video) {
        if (video.currentTime !== 0) {
           
        }
    }

    onVideoChanged(video) {
       
    }

    onSceneDetected() {
        
    }

    componentDidMount() {

    }

    render() {
        return (
            <div className="timeline">
                <div className="frames">
                    {this.props.frames.map((frame) =>
                        <Canvas key={frame.num} frame={frame}></Canvas>
                    )}
                </div>                
                <div className="time">
                    
                </div>
            </div>
        );
    }
}

export default Timeline;

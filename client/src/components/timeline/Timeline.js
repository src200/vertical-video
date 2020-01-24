import React, { Component } from 'react';
import './Timeline.scss';
import Canvas from '../canvas/Canvas';

class Timeline extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        
    }

    render() {
        const canvases = this.props.frames.map((frame) =>
            <Canvas key={frame.num} frame={frame}></Canvas>
        );

        return (
            <div className="timeline">
                <div className="frames">
                    {canvases}
                </div>
                <div className="time">

                </div>
            </div>
        );
    }
}

export default Timeline;

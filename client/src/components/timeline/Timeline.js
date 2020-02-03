import React, { Component } from 'react';
import './Timeline.scss';
import Canvas from '../canvas/Canvas';
import { Row, Col} from 'antd';


class Timeline extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="timeline">
                <Row>
                    <Col span={24}>
                        <div className="frames">
                            {this.props.frames.map(frame =>
                                frame.isKeyFrame ? <Canvas key={frame.num} frame={frame} updatePosition={this.props.updatePosition}></Canvas> : null)
                            }
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default Timeline;

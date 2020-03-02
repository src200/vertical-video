import React from 'react';
import './Timeline.scss';
import Canvas from '../canvas/Canvas';
import { Row, Col } from 'antd';

const Timeline = (props) => {
    return (
        <div className="timeline">
            <Row>
                <Col span={24}>
                    <div className="frames">
                        {props.frames.map(frame =>
                            frame.isKeyFrame ? <Canvas key={frame.num} frame={frame} updatePosition={props.updatePosition}></Canvas> : null)
                        }
                    </div>
                </Col>
            </Row>
        </div>
    )
}

export default Timeline;

import React, { Component } from 'react';
import './Resizer.scss';

class Resizer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            resizerX: 0,
            resizerY: 0,
            offsetX: 0,
            offsetY: 0,
            mouseX: 0,
            mouseY: 0,
            width: 100,
            height: 100
        };

        this.isMouseDown = false;

        this.mouseDown = this.mouseDown.bind(this);
        this.mouseMove = this.mouseMove.bind(this);
        this.mouseUp = this.mouseUp.bind(this);
    }

    mouseDown(e) {
        this.isMouseDown = true;
        this.setState({
            offsetX: e.clientX - this.state.offsetX,
            offsetY: e.clientY - this.state.offsetY
        });
    }

    mouseMove(e) {
        if (this.isMouseDown) {
            this.setState({
                resizerX: e.clientX - this.state.offsetX,
                resizerY: e.clientY - this.state.offsetY
            });
        }
    }

    mouseUp(e) {
        this.isMouseDown = false;
    }

    componentDidMount() {
       
    }

    render() {
        return (
            <div className="resizable"
                style={
                    {
                        left: this.state.resizerX + 'px',
                        top: this.state.resizerY + 'px',
                        width: this.state.width + 'px',
                        height: this.state.height + 'px'
                    }
                }
                onMouseDown={this.mouseDown}
                onMouseMove={this.mouseMove}
                onMouseUp={this.mouseUp}>
                <div className="resizers">
                    <div className="resizer top-left"></div>
                    <div className="resizer top-right"></div>
                    <div className="resizer bottom-left"></div>
                    <div className="resizer bottom-right"></div>
                </div>
            </div>
        )
    }
}

export default Resizer;
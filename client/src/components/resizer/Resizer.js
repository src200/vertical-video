import React, { Component } from 'react';
import './Resizer.scss';

class Resizer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            resizerX: 0,
            resizerY: 0,
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
    }

    mouseMove(e) {
        if (this.isMouseDown) {
            this.setState({
                resizerX: e.clientX,
                resizerY: e.clientY
            });
        }
    }

    mouseUp(e) {
        this.isMouseDown = false;
    }

    componentDidMount() {
        window.addEventListener('mousedown', (e) => {
            this.mouseDown(e);
        }, this);

        window.addEventListener('mousemove', (e) => {
            this.mouseMove(e);
        }, this);

        window.addEventListener('mouseup', (e) => {
            this.mouseUp(e);
        }, this);
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
                }>
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
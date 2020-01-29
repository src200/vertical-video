import React, { Component } from 'react';
import { Rnd } from 'react-rnd';
import './Canvas.scss';

class Canvas extends Component {
    constructor(props) {
        super(props);

        this.state = {
            resizerOpts: {
                className: 'resizer',
                minWidth: 100,
                minHeight: 100,
                bounds: 'parent',
                onDrag: (e, d) => {
                    this.setState({
                        previewFrame: {
                            sx: d.x,
                            sy: d.y,
                            sWidth: e.target.offsetWidth,
                            sHeight: e.target.offsetHeight
                        }
                    });
                }
            }
        }

        /** 
         *  frame prop
        this.frame = {
            num: 0, // frame number,
            src: '', // src of frame( from video)
            sx: 0, // x value of src image
            sy: 0, // y value of src image
            dx: 0, // x value of destination canvas
            dy: 0, // y value of destination canvas
            oh: 0, // original height of video
            ow: 0, // original width of video
            h: 0, //  height of frame
            w: 0, //  width of frame
            t: 0, // time of frame in the video
            ar: 9/16 // aspect ratio of frame( this could change in future for 1:1)
        }
        */

        this.canvasEl = React.createRef();
    }

    componentDidMount() {
        let canvas = this.canvasEl.current;
        let frame = this.props.frame;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        canvas.width = frame.w;
        canvas.height = frame.h;
        ctx.drawImage(
            frame.src,
            frame.x,
            frame.y,
            frame.w,
            frame.h
        );
    }

    render() {
        return (
            <div className="canvas">
                <canvas ref={this.canvasEl}></canvas>
                <Rnd position={{ x: this.props.frame.sx, y: this.props.frame.sy }}
                    size={{ width: this.props.frame.w,  height: this.props.frame.h }}
                    {...this.state.resizerOpts}></Rnd>
            </div>
        );
    }
}

export default Canvas;

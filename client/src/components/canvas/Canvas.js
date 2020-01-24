import React, { Component, Fragment } from 'react';
import './Canvas.scss';

class Canvas extends Component {
    constructor(props) {
        super(props);
        
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
            <Fragment>
               <canvas ref={this.canvasEl}></canvas>
            </Fragment>
        );
    }
}

export default Canvas;

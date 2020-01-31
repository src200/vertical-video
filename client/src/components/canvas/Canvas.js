import React, { Component } from 'react';
// import { Rnd } from 'react-rnd';
import './Canvas.scss';

class Canvas extends Component {
    constructor(props) {
        super(props);

        this.state = {
            frame: props.frame
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
    }

    componentDidMount() {
        let frame = this.state.frame;

        const canvas = this[`canvas_${frame.num}`];
        canvas.frame = frame.num;
        canvas.ctx = canvas.getContext('2d');
        canvas.rect = {};
        canvas.drag = false;
        canvas.width = frame.w;
        canvas.height = frame.h;
        canvas.rect.startX = (frame.sx * frame.w) / 640;
        canvas.rect.startY = frame.sy;
        canvas.rect.w = frame.h * (9 / 16);
        canvas.rect.h = frame.h

        canvas.addEventListener('mousedown', (e) => {
            canvas.drag = true;
        });

        canvas.addEventListener('mouseup', (e) => {
            canvas.drag = false;
        });

        canvas.addEventListener('mousemove', (e) => {
            if (canvas.drag) {
                canvas.rect.startX = (e.pageX - this.offsetLeft) - canvas.rect.w;
                canvas.rect.startY = (e.pageY - this.offsetTop) - canvas.rect.h;
                canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
                draw();
            }
        });

        const draw = () => {
            canvas.ctx.putImageData(
                frame.src,
                frame.x,
                frame.y,
            );
            
            canvas.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            canvas.ctx.fillRect(canvas.rect.startX, canvas.rect.startY, canvas.rect.w, canvas.rect.h);
        }
        
        draw();
    }

    render() {
        return (
            <div className="canvas">
                <canvas ref={canvas => {this[`canvas_${this.props.frame.num}`] = canvas}}></canvas>
            </div>
        );
    }
}

export default Canvas;

import React, { useEffect, useRef } from 'react';
import './Canvas.scss';

const Canvas = (props) => {
    let canvasEl = useRef(null);

    useEffect(() => {
        let frame = props.frame;

        const canvas = canvasEl;
        canvas.ctx = canvas.getContext('2d');
        canvas.rect = {};
        canvas.drag = false;
        canvas.width = frame.w;
        canvas.height = frame.h;
        canvas.rect.startX = (frame.sx * frame.w) / 640; // TODO
        canvas.rect.startY = frame.sy;
        canvas.rect.w = frame.h * (9 / 16);
        canvas.rect.h = frame.h;
        canvas.mouseDownPosition = -1;

        canvas.addEventListener('mousedown', (e) => {
            canvas.drag = true;
            canvas.mouseDownPosition = e.clientX - e.offsetX;
        });

        canvas.addEventListener('mouseup', (e) => {
            canvas.drag = false;
        });

        canvas.addEventListener('mousemove', (e) => {
            if (canvas.drag) {
                canvas.rect.startX = e.clientX - canvas.mouseDownPosition;
                canvas.rect.startY = 0;

                // drag rect within canvas bounds
                if (canvas.rect.startX >= 0 && (canvas.rect.startX + canvas.rect.w) <= canvas.width) {
                    updatePosition(canvas.rect, frame);
                    canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
                    draw();
                }
            }
        });

        draw(canvas, frame);
    });

    const updatePosition = (rect, frame) => {
        let pos = { x: 0, y: 0 };
        pos.x = (rect.startX * 640) / frame.w; // TODO
        props.updatePosition(pos, frame.num);
    };

    const draw = (canvas, frame) => {
        // canvas.ctx.globalAlpha = 0.2;
        // canvas.ctx.globalCompositeOperation = 'source-in';
        canvas.ctx.putImageData(
            frame.src,
            frame.x,
            frame.y,
        );

        canvas.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        canvas.ctx.fillRect(canvas.rect.startX, canvas.rect.startY, canvas.rect.w, canvas.rect.h);
        // canvas.scrollIntoView();
    };

    return (
        <canvas ref={c => canvasEl = c}></canvas>
    )
}

export default Canvas;

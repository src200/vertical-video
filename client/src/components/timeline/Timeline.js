import React, { Component } from 'react';
import './Timeline.scss';

const URL = window.URL;
class Timeline extends Component {
    constructor(props) {
        super(props); // props contains video element
        this.video = props.video;
        // this.canvasEl = React.createRef();
        this.state = {
            canvasFrames: []
        }
    }

    componentDidMount() {
        // const ctx = this.canvasEl.current.getContext('2d');
        let frames = [];
        let count = 1;
        

        const drawFrames = (video) => {
            if (!video.paused && !video.ended) {
                let frame = { 
                    w: this.video.width,
                    h: this.video.height,
                    x: 0, 
                    y: 0, 
                    src: URL.createObjectURL(video),
                    count: count,
                };

                frames.push(frame);

                // frame.x = frame.count * frame.w;
                // ctx.drawImage(video, 0, 0, frame.w, frame.h, frame.x, frame.y, frame.w, frame.h);
                count++;

                window.requestAnimationFrame(() => drawFrames(video));
            }
        }

        const showFrames = () => {
            let canvasFrames = frames.map((frame) =>
              <img src={frame.src} key={frame.count} id={frame.count} width={120} height={85}></img>
            );

            this.setState({
                canvasFrames: canvasFrames
            });
        }

        // event triggered on playing video
        this.video.addEventListener('play', (e) => {
            drawFrames(this.video);
        });

        // event triggered on playing video
        this.video.addEventListener('pause', (e) => {
            showFrames();
        });

        // event triggered while playing video
        this.video.addEventListener('timeupdate', (e) => {

        });
    }

    render() {
        return (
            <div className="timeline" style={{ width: this.video.width }}>
                <div className="frames">
                    {this.state.canvasFrames}
                </div>
                <div className="time">

                </div>
            </div>
        );
    }
}

export default Timeline;

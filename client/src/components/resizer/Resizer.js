import React, { Component } from 'react';
import './Resizer.scss';

class Resizer extends Component {
    componentDidMount() {
        // initialize all mouse events
    }

    render() {
        return (
            <div className="resizable">
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
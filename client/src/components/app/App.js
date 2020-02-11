import React, { Component } from "react";
import "./App.scss";
import Uploader from "../uploader/Uploader";
import Player from "../player/Player";
import { Layout } from 'antd';
import { connect }  from 'react-redux';

const { Content } = Layout;

const mapStateToProps = (state) => {

}

const mapDispatchToProps = (dispatch) => {

}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            aspectRatio: '',
            videoSrc: ''
        };

        this.captureVideoSrc = this.captureVideoSrc.bind(this);
        this.setAspectRatio = this.setAspectRatio.bind(this);
    }

    captureVideoSrc(src) {
        if (src instanceof File) {
            this.setState( {
                videoSrc: URL.createObjectURL(src)
            });
        } else {
            this.setState( {
                videoSrc: src
            });
        }
    }

    setAspectRatio(aspectRatio) {
        if (aspectRatio) {
            this.setState({ aspectRatio: aspectRatio });
        }
    }

    render() {
        return (
            <Layout>
                <Layout className="App">
                    <Content className="App-content">
                        <div className="App-uploader">
                            <Uploader liftVideoSrc={this.captureVideoSrc}></Uploader>
                        </div>
                        <div className="App-player">
                            <Player videoSrc={this.state.videoSrc}></Player>
                        </div>
                    </Content>
                </Layout>
            </Layout>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

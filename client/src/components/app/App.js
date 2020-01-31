import React, { Component } from "react";
import "./App.scss";
import Uploader from "../uploader/Uploader";
import Player from "../player/Player";
import { Layout } from 'antd';

const { Content } = Layout;

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
                {/* <Sider>
                    <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                        <Menu.Item key="1">
                            <a onClick={this.setAspectRatio.bind(this, '9:16')}>
                                <span>9:16</span>
                            </a>
                        </Menu.Item>
                        <Menu.Item key="2">
                            <a onClick={this.setAspectRatio.bind(this, '4:5')}>
                                <span>4:5</span>
                            </a>
                        </Menu.Item>
                    </Menu>
                </Sider> */}
                <Layout className="App">
                    {/* <Header className="App-header">
                    <div>
                        Header
                    </div> 
                </Header> */}
                    <Content className="App-content">
                        <div className="App-uploader">
                            <Uploader liftVideoSrc={this.captureVideoSrc}></Uploader>
                        </div>
                        <div className="App-player">
                            <Player videoSrc={this.state.videoSrc}></Player>
                        </div>
                    </Content>
                    {/* <Footer className="App-footer">
                    <div>
                        Footer
                    </div>
                </Footer> */}
                </Layout>
            </Layout>
        );
    }
}

export default App;

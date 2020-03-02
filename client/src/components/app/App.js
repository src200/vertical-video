import React, { useState } from "react";
import "./App.scss";
import Uploader from "../uploader/Uploader";
import Player from "../player/Player";
import { Layout } from 'antd';

const { Content } = Layout;

const App = (props) => {
    const [videoSrc, setVideoSrc] = useState('');

    const captureVideoSrc = (src) => {
        setVideoSrc(URL.createObjectURL(src));
    };
        
    return (
        <Layout className="App">
            <Content className="App-content">
                <div className="App-uploader">
                    <Uploader liftVideoSrc={captureVideoSrc}></Uploader>
                </div>
                <div className="App-player">
                    <Player videoSrc={videoSrc}></Player>
                </div>
            </Content>
        </Layout>
    );
}

export default App;

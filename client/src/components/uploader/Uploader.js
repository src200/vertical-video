import React, { Component } from "react";
import "./Uploader.scss";
import { Upload, message, Button, Icon } from 'antd';

class Uploader extends Component {
    constructor(props) {
        super(props);

        this.state = {
            videoSrc: '',
            showVideoPreview: false
        };

        this.onChange = this.onChange.bind(this);
        this.beforeUpload = this.beforeUpload.bind(this);
    }

    beforeUpload(file) {
        if(file) {
            this.setState({
                videoSrc: URL.createObjectURL(file),
                showVideoPreview: true
            });
        }
    }

    onChange(info) {
        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    }

    render() {
        const videoElement =
            <video src={this.state.videoSrc} controls muted="true" height="200" width="400">
                Sorry, your browser doesn't support embedded videos.
            </video>

        return (
            <div className="Uploader">
                <Upload name="file" accept="video/mp4,video/x-m4v,video/*" action= "http://localhost:8080/upload"
                     beforeUpload={this.beforeUpload} onChange={this.onChange}>
                    <Button type="primary" size="large">
                        <Icon type="upload" /> Choose a video file
                    </Button>
                </Upload>
                {this.state.showVideoPreview ? videoElement : null}
            </div>
        );
    }
}

export default Uploader;

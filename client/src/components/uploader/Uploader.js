import React, { Component } from "react";
import "./Uploader.scss";
import { Upload, Input, message, Button, Icon } from 'antd';

class Uploader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            videoUrl: ''
        };

        this.onChange = this.onChange.bind(this);
        this.beforeUpload = this.beforeUpload.bind(this);
    }

    componentDidMount() {
        // console.log(this.props);
    }

    beforeUpload(src) {
        if(src instanceof File) {
            this.props.liftVideoSrc(src);
        } else {
            this.setState({videoUrl: src.target.value});
            if (src.target.value) {
                this.props.liftVideoSrc(src.target.value);
            }
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
        return (
            <div className="Uploader">
                <Input className="input-url" type="url" placeholder="Paste youtube video url here" value={this.state.videoUrl} onChange={this.beforeUpload}/>
                <Upload name="file" accept="video/mp4,video/x-m4v,video/*" action= "http://localhost:8080/upload"
                     beforeUpload={this.beforeUpload} onChange={this.onChange}>
                    <Button type="primary" size="large">
                        <Icon type="upload" /> Choose a video file
                    </Button>
                </Upload>
            </div>
        );
    }
}

export default Uploader;

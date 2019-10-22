import React, { Component } from "react";
import "./Uploader.scss";
import { Upload, message, Button, Icon } from 'antd';

class Uploader extends Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.beforeUpload = this.beforeUpload.bind(this);
    }

    componentDidMount() {
        // console.log(this.props);
    }

    beforeUpload(file) {
        if(file) {
            this.props.liftVideoSrc(file);
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

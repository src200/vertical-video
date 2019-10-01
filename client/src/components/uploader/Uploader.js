import React, { Component } from "react";
import "./Uploader.scss";
import { Upload, message, Button, Icon } from 'antd';

class Uploader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: 'file',
            accept: 'video/mp4,video/x-m4v,video/*',
            showUploadList: { showPreviewIcon: true, showRemoveIcon: false },
            action: 'http://localhost:8080/upload',
            onChange(info) {
                if (info.file.status !== 'uploading') {
                    console.log(info.file, info.fileList);
                }
                if (info.file.status === 'done') {
                    message.success(`${info.file.name} file uploaded successfully`);
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`);
                }
            },
        };
    }
    render() {
        return (
            <div className="Uploader">
                <Upload {...this.state}>
                    <Button type="primary" size="large">
                        <Icon type="upload" /> Choose a video file
                    </Button>
                </Upload>
            </div>
        );
    }
}

export default Uploader;

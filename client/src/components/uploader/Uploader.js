import React, { Component } from "react";
import "./Uploader.scss";
import { Upload, message, Button, Icon } from 'antd';

class Uploader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: 'file',
            action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
            headers: {
                authorization: 'authorization-text',
            },
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
                    <Button>
                        <Icon type="upload" /> Click to Upload
                    </Button>
                </Upload>
            </div>
        );
    }
}

export default Uploader;

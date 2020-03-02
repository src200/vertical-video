import React, { useState } from "react";
import "./Uploader.scss";
import { Upload, Input, message, Button, Icon } from 'antd';

const Uploader = (props) => {
    const [videoUrl, setVideoUrl] = useState('');

    const beforeUpload = (src) => {
        if (src instanceof File) {
            props.liftVideoSrc(src);
        } else {
            setVideoUrl(src.target.value);
            if (src.target.value) {
                props.liftVideoSrc(src.target.value);
            }
        }
    };

    const onChange = (info) => {
        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    };

    return (
        <div className="Uploader">
            <Upload name="file" accept="video/mp4,video/x-m4v,video/*" action= "http://localhost:8080/upload"
                 beforeUpload={beforeUpload} onChange={onChange}>
                <Button type="primary" size="large">
                    <Icon type="upload" /> Choose a video file
                </Button>
            </Upload>
        </div>
    );
}

export default Uploader;

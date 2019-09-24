import React, { Component } from "react";
import { Form, Select, InputNumber, DatePicker, Switch, Slider, Button } from 'antd';
import logo from "./logo.svg";
import "./App.css";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { apiResponse: "" };
    }

    callAPI() {
        fetch("http://localhost:8080/testAPI")
            .then(res => res.text())
            .then(res => this.setState({ apiResponse: res }))
            .catch(err => err);
    }

    componentDidMount() {
        this.callAPI();
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Welcome</h1>
                </header>
                <Form style={{ marginTop: 32 }}>
                    <Form.Item
                        label="数字输入框"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 8 }}
                    >
                        <InputNumber min={1} max={10} defaultValue={3} />
                        <span className="ant-form-text"> 台机器</span>
                        <a href="https://ant.design">链接文字</a>
                    </Form.Item>
                    <Form.Item
                        label="开关"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 8 }}
                    >
                        <Switch defaultChecked />
                    </Form.Item>
                    <Form.Item
                        label="滑动输入条"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 8 }}
                    >
                        <Slider defaultValue={70} />
                    </Form.Item>
                    <Form.Item
                        label="选择器"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 8 }}
                    >
                    </Form.Item>
                    <Form.Item
                        label="日期选择框"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 8 }}
                    >
                        <DatePicker />
                    </Form.Item>
                    <Form.Item wrapperCol={{ span: 8, offset: 8 }}>
                        <Button type="primary" htmlType="submit">
                            确定
      </Button>
                        <Button style={{ marginLeft: 8 }}>
                            取消
      </Button>
                    </Form.Item>
                </Form>
                <p className="App-intro">{this.state.apiResponse}</p>
            </div>
        );
    }
}

export default App;

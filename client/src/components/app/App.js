import React, { Component } from "react";
import "./App.scss";
import Uploader from "../uploader/Uploader";
import { Layout, Menu } from 'antd';

const { Header, Footer, Content, Sider } = Layout;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            aspectRatio: ''
        };
        this.setAspectRatio = this.setAspectRatio.bind(this);
    }

    setAspectRatio(aspectRatio) {
        if (aspectRatio) {
            this.setState({ aspectRatio: aspectRatio });
        }
    }

    render() {
        return (
            <Layout>
                <Sider>
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
                </Sider>
                <Layout>
                    {/* <Header className="App-header">
                    <div>
                        Header
                    </div> 
                </Header> */}
                    <Content className="App">
                        <div className="App-content">
                            <Uploader className="App-uploader" aspectRatio={this.state.aspectRatio}></Uploader>
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

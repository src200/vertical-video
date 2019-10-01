import React, { Component } from "react";
import "./App.scss";
import Uploader from "../uploader/Uploader";
import { Layout } from 'antd';

const { Header, Footer, Content } = Layout;

class App extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <Layout className="App">
                {/* <Header className="App-header">
                    <div>
                        Header
                    </div> 
                </Header> */}
                <Content className="App-content">
                    <div className="App-uploader">
                        <Uploader></Uploader>
                    </div>
                </Content>
                {/* <Footer className="App-footer">
                    <div>
                        Footer
                    </div>
                </Footer> */}
            </Layout>
        );
    }
}

export default App;

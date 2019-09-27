import React, { Component } from "react";
import "./App.css";
import Uppy from "@uppy/core";
import { Dashboard } from '@uppy/react';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { apiResponse: "" };
        this.uppy = Uppy().use(Dashboard, { id: 'Dashboard' });
    }

    componentDidMount() {
        
    }

    componentWillUnmount() {
        this.uppy.close();;
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                </header>
                <Dashboard uppy={this.uppy} />
            </div>
        );
    }
}

export default App;

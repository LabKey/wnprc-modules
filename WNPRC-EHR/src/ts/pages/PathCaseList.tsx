import * as api from "WebUtils/API";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as $ from 'jquery';

// Info
api.selectRows('core', 'users', {}).then(function(data) {
    console.log("data", data);
    console.log("data", data);
});

export interface HelloProps { compiler: string; framework: string; }

// 'HelloProps' describes the shape of props.
// State is never set so we use the 'undefined' type.
export class Hello extends React.Component<HelloProps, undefined> {
    render() {
        return <h1>Hello from {this.props.compiler} and {this.props.framework}!</h1>;
    }
}

export class Page extends React.Component<any, any> {
    render() {
        return <Hello compiler="TypeScripts" framework="React" />;
    }
}

ReactDOM.render(
    <Page />,
    $("#react-page").get(0)
);
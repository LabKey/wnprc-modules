import {ToolBar} from "../lib/toolbar";
import * as ReactDOM from "react-dom";
import * as React from "react";

class Page extends React.Component<any, any> {
    render() {
        return (
            <ToolBar/>
        )
    }
}

ReactDOM.render(
    <Page/>,
    $("#reactDiv").get(0)
);
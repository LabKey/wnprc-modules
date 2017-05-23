import * as React from "react";
import * as ReactDOM from "react-dom";
import Component = React.Component;

class Page extends Component<{}, {}> {

}

// Render the page into the react div
ReactDOM.render(
    <Page />,
    $("#manageTemplates").get(0)
);
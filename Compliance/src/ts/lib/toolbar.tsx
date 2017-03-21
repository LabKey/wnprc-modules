import * as React from "react";

export class ToolBar extends React.Component<any, any> {
    render() {
        let id = "bs-example-navbar-collapse-1";

        let betaStyle: CSSStyleRule = {
            color: 'red',
            fontStyle: 'italic',
            fontVariant: 'small-caps'
        };
        let betaSpan = (
            <span style={betaStyle}>beta</span>
        );

        let hamburgerButton = (
            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target={id} aria-expanded="false">
                <span className="sr-only">Toggle navigation</span>

                {/* Hamburger button */}
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>

            </button>

        );

        return (
            <nav className="navbar navbar-default">
                <div className="container-fluid">
                    <div className="navbar-header">
                        {hamburgerButton}
                        <a className="navbar-brand" href="#">EHR {betaSpan}</a>
                    </div>

                    {/* This is the content for the navbar */}
                    <div className="collapse navbar-collapse" id={id}>

                        {/* Search bar */}
                        <form className="navbar-form navbar-right">
                            <div className="form-group">
                                <div className="input-group">
                                    <input type="text" className="form-control" placeholder="Search" />

                                    <span className="input-group-addon"><i className="glyphicon glyphicon-search"></i></span>
                                </div>
                            </div>
                        </form>
                    </div>

                </div>
            </nav>
        )
    }
}
import {ToolBar} from "../lib/toolbar";
import * as ReactDOM from "react-dom";
import * as React from "react";
import ChangeEvent = React.ChangeEvent;

interface Protocol {
    number: string
}

interface ProtocolBasicInfoVM {
    protocol: Protocol;
    onProtocolChange(protocol: Protocol): void
}

class ProtocolBasicInfo extends React.Component<ProtocolBasicInfoVM, {protocol: Protocol}> {
    constructor(props: any) {
        super(props);

        this.state = {
            protocol: this.props.protocol
        };

        this.handleNumberChange = this.handleNumberChange.bind(this);
    }

    handleNumberChange(e: ChangeEvent<HTMLInputElement>) {
        this.setState({protocol: {number: e.target.value}}, () => {
            this.props.onProtocolChange(this.state.protocol);
        });
    }

    render() {
        return (
            <div className="panel panel-primary">
                <div className="panel-heading">Basic Info</div>
                <div className="panel-body">
                    <form className="form-horizontal">
                        <div className="form-group">
                            <label className="col-sm-2 control-label">Number</label>
                            <div className="col-sm-10">
                                <input className="form-control" type="text" onChange={this.handleNumberChange} />
                            </div>
                        </div>

                        <fieldset>
                            <legend>This Involves</legend>

                            <div className="checkbox checkbox-primary">
                                <input type="checkbox" id="checkbox1"/>

                                <label htmlFor="checkbox1">
                                    Chemical Agents
                                </label>
                            </div>
                        </fieldset>
                    </form>
                </div>
            </div>
        )
    }
}

class Page extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            protocol: {
                number: ''
            }
        };

        this.protocolChangeHandler = this.protocolChangeHandler.bind(this);
    }

    protocolChangeHandler(protocol: Protocol): void {
        this.setState({protocol: protocol});
    }

    render() {

        return (
            <div>
                <ToolBar/>

                <div className="container">
                    <div className="col-sm-3">
                        <div className="panel panel-primary">
                            <div className="panel-heading">Protocols</div>
                            <div className="panel-body">
                                <ul>
                                    <li>New Protocol</li>
                                    <li>List Protocols</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="col-sm-9">
                        <div className="panel panel-primary">
                            <div className="panel-heading">New Protocol {this.state.protocol.number && (<span>({this.state.protocol.number})</span>)}</div>
                            <div className="panel-body">
                                <ProtocolBasicInfo protocol={this.state.protocol} onProtocolChange={this.protocolChangeHandler} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

ReactDOM.render(
    <Page/>,
    $("#reactDiv").get(0)
);
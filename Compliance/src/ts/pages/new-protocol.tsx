import {ToolBar} from "../lib/toolbar";
import * as ReactDOM from "react-dom";
import * as React from "react";
import ChangeEvent = React.ChangeEvent;
import Moment = moment.Moment;
import moment = require("moment");
import {ProtocolSpeciesTabset} from "../lib/protocol/species-tabset";
import * as ReactTabs from 'react-tabs';
import TabList = ReactTabs.TabList;
import Tabs = ReactTabs.Tabs;
import TabPanel = ReactTabs.TabPanel;
import Tab = ReactTabs.Tab;
import {ProtocolFlags, ProtocolFlagName, Protocol, SpeciesProtocolInfo} from "../lib/protocol/protocol";
import {CheckBoxSet} from "../lib/checkboxset";

class ProtocolCheckboxSet extends CheckBoxSet<ProtocolFlagName> {

}

interface ProtocolBasicInfoVM {
    protocol: Protocol;
    onProtocolChange(protocol: Protocol): void
}

interface TextInputProps {
    property_name: string;
    label?: string;
    handleChange?(label: string, val: string): void;
}

class TextInput extends React.Component<TextInputProps, {}> {
    constructor(props: TextInputProps) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e: ChangeEvent<HTMLInputElement>) {
        if (this.props.handleChange) {
            this.props.handleChange(this.props.property_name, e.target.value);
        }
    }

    render() {
        return (
            <div className="form-group" key={this.props.property_name}>
                <label className="col-sm-3 control-label">{this.props.label || this.props.property_name}</label>
                <div className="col-sm-9">
                    <input className="form-control" type="text" onChange={this.handleChange} />
                </div>
            </div>
        )
    }
}

class ProtocolBasicInfo extends React.Component<ProtocolBasicInfoVM, {protocol: Protocol}> {
    constructor(props: any) {
        super(props);

        this.state = {
            protocol: this.props.protocol
        };

        this.handleTextChange = this.handleTextChange.bind(this);
    }

    handleTextChange(label: string, value: string) {
        let protocol = this.state.protocol;

        if (label in protocol) {
            (protocol as any)[label] = value;
        }

        this.setState({protocol: protocol}, () => {
            this.props.onProtocolChange(this.state.protocol);
        });
    }

    render() {
        return (
            <form className="form-horizontal">
                <TextInput label="Protocol Number" property_name="number" handleChange={this.handleTextChange} />
                <TextInput label="Title" property_name="title" handleChange={this.handleTextChange} />
                <TextInput label="Principal Investigator" property_name="principal_investigator" handleChange={this.handleTextChange} />
                <TextInput label="SPI Primary" property_name="spi_primary" handleChange={this.handleTextChange} />
                <TextInput label="SPI Secondary" property_name="spi_secondary" handleChange={this.handleTextChange} />

                <ProtocolCheckboxSet title="This Protocol Involves:" flags={this.state.protocol.flags} />
            </form>
        )
    }
}

interface PageState {
    protocol: Protocol;
}

class Page extends React.Component<{}, PageState> {
    constructor(props: {}) {
        super(props);

        let newProtocol: Protocol = {
            number: '',
            principal_investigator: '',
            spi_primary: '',
            spi_secondary: '',
            title: '',
            original_approval_date: moment(),
            approval_date: moment(),
            species: [] as SpeciesProtocolInfo[],
            flags: new ProtocolFlags()
        };

        //window.p = newProtocol;

        this.state = {
            protocol: newProtocol
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

                                <ProtocolSpeciesTabset protocol={this.state.protocol} speciesOptions={(window as any).PageLoadData.lookups.species} />
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
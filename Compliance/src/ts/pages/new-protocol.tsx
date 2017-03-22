import {ToolBar} from "../lib/toolbar";
import * as ReactDOM from "react-dom";
import * as React from "react";
import ChangeEvent = React.ChangeEvent;
import Moment = moment.Moment;
import moment = require("moment");
import {SpeciesSelector, ProtocolSpeciesTabs} from "../lib/protocol/species-tab";
import * as ReactTabs from 'react-tabs';
import TabList = ReactTabs.TabList;
import Tabs = ReactTabs.Tabs;
import TabPanel = ReactTabs.TabPanel;
import Tab = ReactTabs.Tab;
import {ProtocolFlags, ProtocolFlagName, Protocol, SpeciesProtocolInfo, FlagInfo} from "../lib/protocol/protocol";

interface CheckBoxProperties {
    flags: ProtocolFlags
}


class CheckBoxSet extends React.Component<CheckBoxProperties, {}> {
    constructor(props: CheckBoxProperties) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e: ChangeEvent<HTMLInputElement>) {
        let name = e.target.name;
        let val  = !!(e.target.type === 'checkbox' ? e.target.checked : e.target.value);


        this.props.flags.setFlag(name as ProtocolFlagName, val);
    }

    render() {
        let checkboxes = this.props.flags.getFlagNames().map((name: ProtocolFlagName) => {
            let info: FlagInfo = this.props.flags.getFlagInfo(name);
            let id = `checkbox-${name}`;

            return (
                <div className="checkbox checkbox-primary col-sm-4" key={name}>
                    <input type="checkbox" id={id} name={name} onChange={this.handleChange}/>

                    <label htmlFor={id}>
                        {(info.displayName) ? info.displayName : name }
                    </label>
                </div>
            );
        });

        return (
            <fieldset>
                <legend>This Protocol Involves:</legend>

                {checkboxes}
            </fieldset>
        );
    }
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

                <CheckBoxSet flags={this.state.protocol.flags} />
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
        this.addProtocolSpecies = this.addProtocolSpecies.bind(this);
    }

    protocolChangeHandler(protocol: Protocol): void {
        this.setState({protocol: protocol});
    }

    addProtocolSpecies(species_name: string) {
        this.state.protocol.species.push(new SpeciesProtocolInfo(species_name));
        this.forceUpdate();
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

                                <div className="text-center">
                                    <SpeciesSelector options={(window as any).PageLoadData.lookups.species} handleButtonClick={this.addProtocolSpecies} />
                                </div>

                                <ProtocolSpeciesTabs protocol={this.state.protocol} />
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
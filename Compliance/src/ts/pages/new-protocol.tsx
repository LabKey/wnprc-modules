import {ToolBar} from "../lib/toolbar";
import * as ReactDOM from "react-dom";
import * as React from "react";
import * as _ from "underscore";
import ChangeEvent = React.ChangeEvent;

type ProtocolFlagName = "has_biological_hazards" | "has_chemical_hazards" | "has_physical_hazards"
                      | "has_radiation_hazards"  | "has_wildlife_hazards" | "has_other_hazards"
                      | "involves_eurthanasia"   | "allows_single_housing";

class ProtocolFlags {
    private _flags: {[name: string]: FlagInfo} = {};

    constructor() {
        this._initFlag("has_biological_hazards", "Biological Hazards");
        this._initFlag("has_chemical_hazards",   "Chemical Hazards");
        this._initFlag("has_physical_hazards",   "Physical Hazards");
        this._initFlag("has_radiation_hazards",  "Radiation Hazards");
        this._initFlag("has_wildlife_hazards",   "Wildlife Hazards");
        this._initFlag("has_other_hazards",      "Other Hazards");
    }

    private _initFlag(name: ProtocolFlagName, displayName?: string, description?: string) {
        let info: FlagInfo = {
            checked: false
        };

        if (displayName) {
            info.displayName = displayName;
        }

        if (description) {
            info.description = description;
        }

        this._flags[name] = info;
    }

    getFlagNames(): ProtocolFlagName[] {
        return _.keys(this._flags) as ProtocolFlagName[];
    }

    getFlag(name: ProtocolFlagName): boolean {
        return this.getFlagInfo(name).checked;
    }

    getFlagInfo(name: ProtocolFlagName): FlagInfo {
        return (name in this._flags) ? this._flags[name]: {checked: false};
    }

    setFlag(name: ProtocolFlagName, val: boolean): void {
        if (name in this._flags) {
            this._flags[name] = {checked: val};
        }
        else {
            this._flags[name].checked = val;
        }
    }
}

interface CheckBoxProperties {
    flags: ProtocolFlags
}

interface FlagInfo {
    checked:      boolean,
    displayName?: string,
    description?: string
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

interface Protocol {
    number: string;
    flags: ProtocolFlags;
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
        let protocol = this.state.protocol;

        protocol.number = e.target.value;

        this.setState({protocol: protocol}, () => {
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

                        <CheckBoxSet flags={this.state.protocol.flags} />
                    </form>
                </div>
            </div>
        )
    }
}

class Page extends React.Component<any, {protocol: Protocol}> {
    constructor(props: any) {
        super(props);

        let newProtocol: Protocol = {
            number: '',
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
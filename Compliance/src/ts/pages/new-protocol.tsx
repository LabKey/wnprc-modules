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
import {newUUID} from "../../../../WebUtils/src/ts/WebUtils/Util";
import CSSProperties = React.CSSProperties;
import * as s from "underscore.string";
import {NewProtocolForm} from "GeneratedFromJava";

function submit(): void {
    let form = new NewProtocolForm();
    form.id = newUUID();
}

class ProtocolCheckboxSet extends CheckBoxSet<ProtocolFlagName> {

}

interface ProtocolBasicInfoVM {
    protocol: Protocol;
    onProtocolChange(protocol: Protocol): void,
    beginEdit: () => void;
    endEdit: () => void;
    disabled: boolean;
}

interface TextInputProps {
    property_name: string;
    label?: string;
    handleChange?(label: string, val: string): void;
    editable: boolean;
    value: string;
}

interface EditableSectionProps {
    isUnblocked: boolean;
}

class UnblockedSection extends React.Component<EditableSectionProps, {}> {
    private _innerDiv: HTMLDivElement;
    private _outerDiv: HTMLDivElement;

    constructor(props: EditableSectionProps) {
        super(props);
    }

    componentDidMount() {
        if (this.props.isUnblocked) {
            this.makeEditable();
        }
    }

    componentDidUpdate() {
        if (this.props.isUnblocked) {
            this.makeEditable();
        }
        else {
            this.unmakeEditable();
        }
    }

    makeEditable(): void {
        if (!this._innerDiv || !this._outerDiv) {
            return;
        }

        let $innerDiv = $(this._innerDiv);
        let $outerDiv = $(this._outerDiv);

        $outerDiv
            .width($innerDiv.width())
            .height($innerDiv.height());

        $innerDiv.css({
            position: 'absolute',
            'z-index': 2000, // The Z-index of jQuery.blockUI elements are between 1000 and 1020.
            'background-color': 'white',
            'border-radius': '8px'
        });

        $innerDiv
            .width($outerDiv.outerWidth())
            .height($outerDiv.outerHeight());

    }

    unmakeEditable() {
        if (!this._innerDiv || !this._outerDiv) {
            return;
        }

        let $innerDiv = $(this._innerDiv);
        let $outerDiv = $(this._outerDiv);

        $innerDiv.css('height', '').css('width', '');
        $outerDiv.css('height', '').css('width', '');

        $innerDiv.css({
            position: '',
            'z-index': '',
            'background-color': '',
            'border-radius': ''
        });
    }

    render() {
        return (
            <div ref={(div) => {this._outerDiv = div;}}>
                <div ref={(div) => {this._innerDiv = div}}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}

interface BlockableDivProps {
    disabled: boolean;
    className: string;
}

class BlockableDiv extends React.Component<BlockableDivProps, {isBlocked: boolean}> {
    id: string = newUUID();
    _div: HTMLDivElement;
    private _isBlocked: boolean;

    constructor(props: BlockableDivProps) {
        super(props);

        this._isBlocked = props.disabled;
    }

    componentDidMount() {
        if (this._div) {
            let $div = $(this._div) as any;

            if (this.props.disabled) {
                $div.block({message: null});
            }
            else {
                $div.unblock();
            }
        }
    }

    componentDidUpdate() {
        if (this._div) {
            let $div = $(this._div) as any;

            if (this._isBlocked !== this.props.disabled) {
                (this.props.disabled) ? $div.block({message: null}) : $div.unblock();
                this._isBlocked = this.props.disabled;
            }
        }
    }

    render() {
        return (
            <div ref={(div) => {this._div = div} } className={this.props.className}>
                {this.props.children}
            </div>
        )
    }
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
        let pStyle: CSSProperties = {
            whiteSpace: 'pre-line',
            overflow: 'hidden'
        };

        if (s.isBlank(this.props.value)) {
            pStyle['fontStyle'] = 'italic';
            pStyle['color'] = 'grey';
        }

        return (
            <div className="form-group" style={{marginBottom: '5px'}} key={this.props.property_name}>
                <label className="col-sm-3 control-label">{this.props.label || this.props.property_name}</label>
                <div className="col-sm-9">
                    {
                        (this.props.editable) ? (
                            <input value={this.props.value} className="form-control" type="text" onChange={this.handleChange} />
                        ) : (
                            <p style={pStyle} className="form-control-static">
                                {s.isBlank(this.props.value) ? 'None Specified' : this.props.value}
                            </p>
                        )
                    }

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
            <div className="container-fluid">
                <h3>
                    Basic Info
                    {
                        (this.props.disabled) ? (
                            <a href="#" className="btn btn-primary btn-xs" style={{marginLeft: '5px'}} onClick={this.props.beginEdit}>
                                <i className="fa fa-pencil"/>Edit
                            </a>
                        ) : (
                            <a href="#" className="btn btn-primary btn-xs" style={{marginLeft: '5px'}} onClick={this.props.endEdit}>
                                <i className="fa fa-save"/>Save
                            </a>
                        )
                    }
                </h3>
                <hr />

                <fieldset className="form-horizontal" disabled={this.props.disabled}>
                    <TextInput editable={!this.props.disabled} value={this.state.protocol.number} label="Protocol Number" property_name="number" handleChange={this.handleTextChange} />
                    <TextInput editable={!this.props.disabled} value={this.state.protocol.title} label="Title" property_name="title" handleChange={this.handleTextChange} />
                    <TextInput editable={!this.props.disabled} value={this.state.protocol.principal_investigator} label="Principal Investigator" property_name="principal_investigator" handleChange={this.handleTextChange} />
                    <TextInput editable={!this.props.disabled} value={this.state.protocol.spi_primary} label="SPI Primary" property_name="spi_primary" handleChange={this.handleTextChange} />
                    <TextInput editable={!this.props.disabled} value={this.state.protocol.spi_secondary} label="SPI Secondary" property_name="spi_secondary" handleChange={this.handleTextChange} />

                    <ProtocolCheckboxSet title="This Protocol Involves:" flags={this.state.protocol.flags} />
                </fieldset>
            </div>
        )
    }
}

interface PageState {
    protocol: Protocol;
    sectionToEdit: string | null;
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
            protocol: newProtocol,
            sectionToEdit: null
        };

        this.protocolChangeHandler = this.protocolChangeHandler.bind(this);
        this.setSectionToEdit = this.setSectionToEdit.bind(this);
        this.clearSectionToEdit = this.clearSectionToEdit.bind(this);
    }

    protocolChangeHandler(protocol: Protocol): void {
        this.setState({protocol: protocol});
    }

    setSectionToEdit(name: string) {
        this.setState({sectionToEdit: name})
    }

    clearSectionToEdit() {
        this.setState({sectionToEdit: null})
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
                            <div className="panel-heading">
                                New Protocol {this.state.protocol.number && (<span>({this.state.protocol.number})</span>)}
                                </div>

                            <BlockableDiv disabled={this.state.sectionToEdit !== null} className="panel-body">
                                <UnblockedSection isUnblocked={this.state.sectionToEdit === 'info'}>
                                    <ProtocolBasicInfo protocol={this.state.protocol}
                                                       onProtocolChange={this.protocolChangeHandler}
                                                       beginEdit={() => {this.setSectionToEdit('info')}}
                                                       endEdit={this.clearSectionToEdit}
                                                       disabled={this.state.sectionToEdit !== 'info'}
                                    />
                                </UnblockedSection>


                                <ProtocolSpeciesTabset protocol={this.state.protocol} speciesOptions={(window as any).PageLoadData.lookups.species} />
                            </BlockableDiv>
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
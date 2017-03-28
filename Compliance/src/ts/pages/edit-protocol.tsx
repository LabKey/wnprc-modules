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
import {NewProtocolForm} from "GeneratedFromJava";
import {BlockableDiv} from "../lib/blockable-div";
import {UnblockedSection} from "../lib/unblocked-section";
import {EditableSection} from "../lib/editable-section";
import {ProtocolBasicInfoEditor} from "../lib/protocol/basic-info-section";
import {URLForAction} from "../../../../WebUtils/build/generated-ts/GeneratedFromJava";

function submit(): void {
    let form = new NewProtocolForm();
    form.id = newUUID();
}

class ProtocolCheckboxSet extends CheckBoxSet<ProtocolFlagName> {

}

//let checkboxset = <ProtocolCheckboxSet title="This Protocol Involves:" flags={this.state.protocol.flags} />;


interface SectionProps {
    enabled: boolean;

}

interface Section {
    title: string;
    section_id: string;
    getElement: (props: SectionProps) => JSX.Element;
}

interface PageProps {
    revision_id: string;
    saveBasicInfoURL: URLForAction;
    getBasicInfoURL: URLForAction;
}

interface PageState {
    sectionToEdit: string | null;
}

class Page extends React.Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);

        this.state = {
            sectionToEdit: null
        };

        this.setSectionToEdit = this.setSectionToEdit.bind(this);
        this.clearSectionToEdit = this.clearSectionToEdit.bind(this);
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
                                    <li>Protocol List</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="col-sm-9">
                        <div className="panel panel-primary">
                            <div className="panel-heading">
                                Edit Protocol
                            </div>

                            <BlockableDiv disabled={this.state.sectionToEdit !== null} className="panel-body">
                                <UnblockedSection isUnblocked={this.state.sectionToEdit === 'info'}>
                                    <ProtocolBasicInfoEditor revision_id={this.props.revision_id}
                                                             startEdit={() => {this.setSectionToEdit('info')}}
                                                             endEdit={() => {this.clearSectionToEdit()}}
                                                             getURL={this.props.getBasicInfoURL}
                                                             saveURL={this.props.saveBasicInfoURL}
                                    />
                                </UnblockedSection>
                            </BlockableDiv>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

let pageData = (window as any).PageLoadData;

ReactDOM.render(
    <Page revision_id={pageData.revision_id}
          saveBasicInfoURL={URLForAction.fromJSON(pageData.urls.saveBasicInfo)}
          getBasicInfoURL={URLForAction.fromJSON(pageData.urls.getBasicInfo)}
    />,
    $("#reactDiv").get(0)
);
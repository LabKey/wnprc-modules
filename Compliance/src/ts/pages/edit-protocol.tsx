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
import CSSProperties = React.CSSProperties;
import {NewProtocolForm, ProtocolRevisionsForm, ProtocolRevisionForm} from "GeneratedFromJava";
import {BlockableDiv} from "../lib/blockable-div";
import {UnblockedSection} from "../lib/unblocked-section";
import {EditableSection} from "../lib/editable-section";
import {ProtocolBasicInfoEditor} from "../lib/protocol/basic-info-section";
import {URLForAction} from "../../../../WebUtils/build/generated-ts/GeneratedFromJava";
import {HazardsEditor} from "../lib/protocol/hazards-section";
import {buildURL, getCurrentContainer} from "WebUtils/LabKey";
import * as rsvp from "rsvp";
import Promise = rsvp.Promise;
import {getAllRevisions, getEditProtocolRevisionLink} from "../lib/protocol/protocol-api";
import * as _ from "underscore";

const uuidv4 = require("uuid/v4");

function submit(): void {
    let form = new NewProtocolForm();
    form.id = uuidv4();
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
    saveHazardsURL: URLForAction;
    getHazardsURL: URLForAction;
}

interface PageState {
    sectionToEdit: string | null;
    protocolRevisions: ProtocolRevisionsForm | null;
}

function formatDate(moment: Moment): string {
    return moment.format('MMMM Do, YYYY')
}

class Page extends React.Component<PageProps, PageState> {
    dropdownButton: HTMLElement | null;
    protocolRevisionsFormPromise: Promise<ProtocolRevisionsForm, any>;

    constructor(props: PageProps) {
        super(props);

        this.state = {
            sectionToEdit: null,
            protocolRevisions: null
        };

        this.setSectionToEdit = this.setSectionToEdit.bind(this);
        this.clearSectionToEdit = this.clearSectionToEdit.bind(this);

        this.protocolRevisionsFormPromise = getAllRevisions(this.props.revision_id);
    }

    componentDidMount() {
        this.protocolRevisionsFormPromise.then((form: ProtocolRevisionsForm) => {
            this.setState({
                protocolRevisions: form
            });
        });

        if (this.dropdownButton != null) {
            ($(this.dropdownButton) as any).dropdown();
        }
    }

    setSectionToEdit(name: string) {
        this.setState({sectionToEdit: name})
    }

    clearSectionToEdit() {
        this.setState({sectionToEdit: null})
    }

    render() {
        let currentRevisionDate: string = 'Loading...';
        if (this.state.protocolRevisions) {
            _.each(this.state.protocolRevisions.revisions, (revision) => {
                if (revision.revision_id == this.props.revision_id) {
                    currentRevisionDate = formatDate(revision.approval_date);
                }
            })
        }


        let sortedRevisions: ProtocolRevisionForm[] = [];
        if (this.state.protocolRevisions) {
            sortedRevisions = this.state.protocolRevisions.revisions.sort((left, right): number => {
                if (left.approval_date.isBefore(right.approval_date)) {
                    return 1;
                }
                else if (left.approval_date.isAfter(right.approval_date)) {
                    return -1;
                }
                else {
                    return 0;
                }
            }).reverse();
        }


        let isMostCurrentRevision = true;
        if (sortedRevisions.length > 0) {
            if (_.clone(sortedRevisions).reverse()[0].revision_id !== this.props.revision_id) {
                isMostCurrentRevision = false;
            }
        }

        let protocolName = (this.state.protocolRevisions == null) ? 'Loading...' : this.state.protocolRevisions.name;

        return (
            <div>
                <ToolBar/>

                <div className="container">
                    <div className="col-sm-12 col-md-3">
                        <div className="panel panel-primary">
                            <div className="panel-heading">Protocols</div>
                            <div className="panel-body">
                                <ul>
                                    <li>
                                        <a href={buildURL('wnprc_compliance-protocol-view', 'ProtocolList', getCurrentContainer())}>Protocol List</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="col-sm-12 col-md-9">
                        <div className="panel panel-primary">
                            <div className="panel-heading container-fluid">
                                <h3 className="panel-title" style={{display: 'inline', 'verticalAlign': 'middle'}}>
                                    Edit Protocol: {protocolName}


                                    <div className="dropdown pull-right">
                                        <button className="btn btn-success dropdown dropdown-toggle" type="button" ref={(element) => {this.dropdownButton = element;}} {...{'data-toggle': 'dropdown'}}>
                                            {currentRevisionDate}
                                            <span className="caret" style={{marginLeft: '5px'}}/>
                                        </button>

                                        <ul className="dropdown-menu" >
                                            {
                                                sortedRevisions.map((revision) => {
                                                    let href = getEditProtocolRevisionLink(revision.revision_id);
                                                    return (
                                                        <li className={(revision.revision_id == this.props.revision_id) ? 'disabled' : ''} key={revision.revision_id}>
                                                            <a  href={href} >{formatDate(revision.approval_date)}</a>
                                                        </li>
                                                    )
                                                })
                                            }
                                            <li role="separator" className="divider" />
                                            <li><a href="#" style={{color: 'green'}}><i className="fa fa-plus" /> Create New Revision</a></li>
                                            <li><a href="#" style={{color: 'red'}}><i className="fa fa-trash" /> Delete This Revision</a></li>
                                        </ul>
                                    </div>
                                </h3>
                            </div>

                            {
                                (!isMostCurrentRevision) && (
                                    <div className="alert alert-warning">
                                        <strong>Warning!</strong> This is not the most recent revision of {protocolName}
                                    </div>
                                )
                            }

                            <BlockableDiv disabled={this.state.sectionToEdit !== null} className="panel-body">
                                <UnblockedSection isUnblocked={this.state.sectionToEdit === 'info'}>
                                    <ProtocolBasicInfoEditor revision_id={this.props.revision_id}
                                                             startEdit={() => {this.setSectionToEdit('info')}}
                                                             endEdit={() => {this.clearSectionToEdit()}}
                                                             getURL={this.props.getBasicInfoURL}
                                                             saveURL={this.props.saveBasicInfoURL}
                                    />
                                </UnblockedSection>

                                <UnblockedSection isUnblocked={this.state.sectionToEdit === 'hazards'}>
                                    <HazardsEditor revision_id={this.props.revision_id}
                                                   startEdit={() => {this.setSectionToEdit('hazards')}}
                                                   endEdit={() => {this.clearSectionToEdit()}}
                                                   getURL={this.props.getHazardsURL}
                                                   saveURL={this.props.saveHazardsURL}
                                    />
                                </UnblockedSection>

                                <ProtocolSpeciesTabset protocol_revision={this.props.revision_id} />
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
          getHazardsURL={URLForAction.fromJSON(pageData.urls.getHazards)}
          saveHazardsURL={URLForAction.fromJSON(pageData.urls.saveHazards)}
    />,
    $("#reactDiv").get(0)
);
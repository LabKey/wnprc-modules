import * as React from "react";
import * as ReactDOM from "react-dom";
import Component = React.Component;
import * as s from "underscore.string";
import {ManageTemplatesInfo, DataEntryTemplateInfo} from "../../../build/generated-ts/GeneratedFromJava";
import ChangeEvent = React.ChangeEvent;

interface PageProps {
    info: ManageTemplatesInfo;
}

interface PageState {
    filter: string;
    showAll: boolean;
}

class Page extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);

        this.state = {
            filter: "",
            showAll: false
        };

        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.toggleShowAll = this.toggleShowAll.bind(this);
    }

    handleFilterChange(e: ChangeEvent<HTMLInputElement>) {
        this.setState({
            filter: e.target.value
        });
    }

    toggleShowAll(e: any) {
        this.setState({
            showAll: !this.state.showAll
        });

        e.preventDefault();
    }

    render() {
        let filter = this.state.filter;
        let templates = this.props.info.templates;

        if (!s.isBlank(filter)) {
            templates = templates.filter((template: DataEntryTemplateInfo) => {
                return template.title.toLowerCase().indexOf(filter.toLowerCase()) !== -1
            })
        }

        if (!this.state.showAll) {
            templates = templates.filter((template: DataEntryTemplateInfo) => {
                return template.isOwner || template.isInGroup;
            })
        }

        let templateRows = templates.map((template: DataEntryTemplateInfo) => {
            let canEdit = this.props.info.isAdmin || template.isInGroup;
            let canDelete = this.props.info.isAdmin || template.isOwner;

            return (
                <tr key={template.entityid}>
                    <td>
                        <button className={`btn btn-${canEdit ? 'primary' : 'default'} btn-sm`} disabled={!canEdit}>
                            <i className="fa fa-pencil" />
                        </button>
                    </td>
                    <td>
                        <button className={`btn btn-${canDelete ? 'danger' : 'default'} btn-sm`} disabled={!canDelete}>
                            <i className="fa fa-trash" />
                        </button>
                    </td>
                    <td>{template.title}</td>
                    <td>
                        {(template.formType || "").replace(/^study\|\|/, '').replace(/\|\|(.*)\|\|$/, '')}
                    </td>
                    <td>{template.description}</td>
                    <td>{s.isBlank(template.ownerName) ? (<em>Public</em>) : template.ownerName}</td>
                    <td>{template.createdBy}</td>
                </tr>
            );
        });

        return (
            <div className="container">
                <div className="panel panel-primary">
                    <div className="panel-heading">
                        <h3 className="panel-title pull-left" style={{paddingTop: '8px'}}>
                            {(this.state.showAll) ? 'Manage All Templates' : 'Manage My Templates'}
                        </h3>


                        <div className="pull-right">
                            <form className="form-inline">
                                <div className="form-group" style={{marginRight: '10px'}}>
                                    <button className="btn btn-default" onClick={this.toggleShowAll}>
                                        Show {this.state.showAll ? 'My' : 'All'} Templates
                                    </button>
                                </div>

                                <div className="form-group">
                                    <input className="form-control" placeholder="Search By Title..." value={this.state.filter} onChange={this.handleFilterChange} />
                                </div>
                            </form>
                        </div>

                        <div className="clearfix"/>
                    </div>

                    <div className="panel-body">
                        <table className="table">
                            <thead>
                            <tr>
                                <th style={{width: '10px'}}></th>
                                <th style={{width: '10px'}}></th>
                                <th>Title</th>
                                <th>Form Section</th>
                                <th>Description</th>
                                <th>Owner</th>
                                <th>Created By</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                templateRows
                            }
                            </tbody>
                        </table>
                        {
                            templateRows.length == 0 && (
                                <div className="text-center">
                                    <h3>No Templates to Show</h3>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        )
    }
}

// Render the page into the react div
ReactDOM.render(
    <Page info={ManageTemplatesInfo.fromJSON((window as any).PageLoadData)}/>,
    $("#manageTemplates").get(0)
);
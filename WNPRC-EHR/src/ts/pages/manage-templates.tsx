import * as React from "react";
import * as ReactDOM from "react-dom";
import Component = React.Component;
import * as s from "underscore.string";
import {
    ManageTemplatesInfo, DataEntryTemplateInfo,
    UpdateTemplateForm
} from "../../../build/generated-ts/GeneratedFromJava";
import ChangeEvent = React.ChangeEvent;
import * as toastr from "toastr";


import {modal, ModalWrapper, displayError} from "WebUtils/component/modal";
import {UserSelector} from "../lib/UserSelector";
import {deleteTemplate, updateTemplate} from "../lib/dataentry/templates-api";
import {executeSql} from "../../../lkpm/modules/WebUtils/src/ts/WebUtils/API";

interface EditTemplateMetadataFormProps {
    entityId: string;
    title: string;
    description: string;
    owner: number;
}

interface EditTemplateMetadataFormState {
    form: UpdateTemplateForm
}

class EditTemplateMetadataForm extends Component<EditTemplateMetadataFormProps, EditTemplateMetadataFormState> {
    constructor(props: EditTemplateMetadataFormProps) {
        super(props);

        let form = new UpdateTemplateForm();
        form.title = props.title;
        form.description = props.description;
        form.owner = props.owner;

        this.state = {
            form
        };

        this.handleTitleUpdate = this.handleTitleUpdate.bind(this);
        this.handleDescriptionUpdate = this.handleDescriptionUpdate.bind(this);
        this.handleOwnerUpdate = this.handleOwnerUpdate.bind(this);
    }

    handleTitleUpdate(e: ChangeEvent<HTMLInputElement>) {
        let form = this.state.form;
        form.title = e.target.value;
        this.setState({form});
    }

    handleDescriptionUpdate(e: ChangeEvent<HTMLTextAreaElement>) {
        let form = this.state.form;
        form.description = e.target.value;
        this.setState({form});
    }

    handleOwnerUpdate(num: number) {
        let form = this.state.form;
        form.owner = num;
        this.setState({form});
    }

    render() {
        let form = this.state.form;

        return (
            <div>
                <form className="form">
                    <div className="form-group">
                        <label>Original Title</label>
                        <p className="form-control-static">{this.props.title}</p>
                    </div>

                    <div className="form-group">
                        <label>New Title</label>
                        <input type="text" className="form-control" value={form.title} onChange={this.handleTitleUpdate} />
                    </div>


                    <div className="form-group">
                        <label>Owner</label>
                        <UserSelector initialUser={this.props.owner} onChange={this.handleOwnerUpdate}></UserSelector>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea rows={3} style={{height: '150px'}} className="form-control" value={form.description} onChange={this.handleDescriptionUpdate} />
                    </div>
                </form>
            </div>
        )
    }
}

interface PageProps {
    templates: DataEntryTemplateInfo[];
    isAdmin: boolean;
    handleDelete: (template: DataEntryTemplateInfo) => void;
    handleUpdate: (id: string, form: UpdateTemplateForm) => void;
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
        this.edit = this.edit.bind(this);
        this.deleteTemplate = this.deleteTemplate.bind(this);
    }

    handleFilterChange(e: ChangeEvent<HTMLInputElement>) {
        this.setState({
            filter: e.target.value
        });
    }

    deleteTemplate(t: DataEntryTemplateInfo) {
        let onDelete = () => {
            modal.pop();

            deleteTemplate(t.entityid).then(() => {
                this.props.handleDelete(t);
                toastr.success(`Successfully deleted ${t.title}.`);
            }).catch((e) => {
                displayError(e);
            })
        };

        modal.pushState({
            title: "Confirm Deletion",
            body: (
                <div>
                    <p>Are you sure you want to delete <strong>{t.title}</strong>?</p>
                </div>
            ),
            footer: (
                <div>
                    <button type="button" className="btn btn-default" onClick={() => {modal.pop()}}>Cancel</button>
                    <button type="button" className="btn btn-danger" onClick={() => {onDelete()}}>Delete</button>
                </div>
            )
        });
    }

    edit(t: DataEntryTemplateInfo) {
        let formEditor: EditTemplateMetadataForm;

        let save = () => {
            modal.pop();

            if (formEditor) {
                let id = t.entityid;
                let form = formEditor.state.form;

                updateTemplate(id, form).then(() => {
                    this.props.handleUpdate(id, form);

                    let message = (form.title == t.title) ? `Successfully updated ${t.title}` : `Successfully updated ${t.title} to ${form.title}`;
                    toastr.success(message);
                }).catch((e) => {
                    displayError(e);
                });
            }
            else {
                displayError(new Error("Can't find form contents."));
            }
        };

        modal.pushState({
            title: "Edit Template Metadata",
            body: (<EditTemplateMetadataForm entityId={t.entityid} title={t.title} description={t.description} owner={t.ownerId} ref={(editor) => {if (editor != null) {formEditor = editor}}} />),
            footer: (
                <div>
                    <button type="button" className="btn btn-default" onClick={() => {modal.pop()}}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={() => {save()}}>Save</button>
                </div>
            )
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
        let templates = this.props.templates;

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
            let canEdit = this.props.isAdmin || template.isInGroup;
            let canDelete = this.props.isAdmin || template.isOwner;

            return (
                <tr key={template.entityid}>
                    <td>
                        <button className={`btn btn-${canEdit ? 'primary' : 'default'} btn-sm`} disabled={!canEdit} onClick={() => {this.edit(template)}}>
                            <i className="fa fa-pencil" />
                        </button>
                    </td>
                    <td>
                        <button className={`btn btn-${canDelete ? 'danger' : 'default'} btn-sm`} disabled={!canDelete} onClick={() => {this.deleteTemplate(template)}}>
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

interface PageWrapperState {
    templates: DataEntryTemplateInfo[];
    isAdmin: boolean;
}

class PageWrapper extends Component<{}, PageWrapperState> {
    page: Page;

    constructor(props: {}) {
        super(props);

        let info = ManageTemplatesInfo.fromJSON((window as any).PageLoadData);

        this.state = {
            templates: info.templates,
            isAdmin: info.isAdmin
        };

        this.handleTemplateDeletion = this.handleTemplateDeletion.bind(this);
        this.updateTemplate = this.updateTemplate.bind(this);
    }

    handleTemplateDeletion(templateToDelete: DataEntryTemplateInfo) {
        let templates = this.state.templates;

        templates = templates.filter((curTemplate) => {
            return curTemplate.entityid != templateToDelete.entityid;
        });

        this.setState({templates});
    }

    updateTemplate(templateId: string, templateToUpdate: UpdateTemplateForm) {
        let schema = 'core';

        let update = (ownerName: string) => {
            let templates = this.state.templates;

            templates.forEach((curTemplate) => {
                if (curTemplate.entityid == templateId) {
                    curTemplate.title = templateToUpdate.title;
                    curTemplate.description = templateToUpdate.description;
                    curTemplate.ownerId = templateToUpdate.owner;
                    curTemplate.ownerName = ownerName;
                }
            });

            if (this.page) {
                this.page.forceUpdate();
            }
        };

        if (templateToUpdate.owner != 0) {
            executeSql(schema, `SELECT * FROM core.UsersAndGroups WHERE UserId = '${templateToUpdate.owner}'`).then((data: any) => {
                update(data.rows[0]["DisplayName"]);
            });
        }
        else {
            update('');
        }
    }

    render() {
        return (<Page templates={this.state.templates} isAdmin={this.state.isAdmin} handleDelete={this.handleTemplateDeletion} handleUpdate={this.updateTemplate} ref={(p) => {if (p != null) {this.page = p}}} />)
    }
}

// Render the page into the react div
ReactDOM.render(
    <PageWrapper />,
    $("#manageTemplates").get(0)
);
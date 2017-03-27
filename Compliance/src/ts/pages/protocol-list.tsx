import {ToolBar} from "../lib/toolbar";
import * as ReactDOM from "react-dom";
import * as React from "react";
import ChangeEvent = React.ChangeEvent;
import * as $ from "jquery";
import * as moment from "moment";
import Moment = moment.Moment;
import {NewProtocolForm, NewProtocolResponse} from "../../../build/generated-ts/GeneratedFromJava";
import * as api from "Webutils/API";
import {buildURL, getCurrentContainer} from "WebUtils/LabKey";
import * as toastr from "toastr";


export interface DateSelectorProps {
    initialDate?: Moment | KnockoutObservable<Moment>
}

export interface DateSelectorState {
    year: Moment
}

export class DateSelector extends React.Component<DateSelectorProps, DateSelectorState> {
    selectedDate: KnockoutObservable<Moment>;

    constructor(props: DateSelectorProps) {
        super(props);

        // Set a default
        this.selectedDate = ko.observable(moment());

        // If we were passed an observable, use that.  If we were passed a moment, just update our selected date
        // to reflect that value.
        if (this.props && this.props.initialDate) {
            if (ko.isObservable(this.props.initialDate)) {
                this.selectedDate = this.props.initialDate;
            }
            else {
                this.selectedDate(this.props.initialDate);
            }
        }

        this.state = {
            year: this.selectedDate()
        };

        this.selectedDate.subscribe((val) => {
            this.setState({year: val});
            this.getInputElement().data("DateTimePicker").date(this.state.year);
        });

        this.toggle = this.toggle.bind(this);
    }

    componentDidMount() {
        this.init();
    }

    init() {
        // Initialize the DateTimePicker
        (this.getInputElement() as any).datetimepicker({
            format: 'YYYY-MM-DD'
        });

        this.getInputElement().on("dp.change", (e: Event) => {
            if ('date' in e) {
                let date = (e as any).date as any;

                if (date != null && moment.isMoment(date)) {
                    if (!this.selectedDate().isSame(date, 'year')) {
                        this.selectedDate(date);
                    }
                }
            }
        });

        // Set the current value
        this.getInputElement().data("DateTimePicker").date(this.state.year);
    }

    toggle() {
        this.getInputElement().data("DateTimePicker").toggle();
    }

    getInputElement(): JQuery {
        let $this = $(ReactDOM.findDOMNode(this));
        return $this.find('input.date-input');
    }

    render() {
        return (
            <div className="input-group date">
                <input type="text" className="form-control date-input" />
                <span className="input-group-addon" onClick={this.toggle}>
                    <span className="glyphicon glyphicon-calendar"/>
                </span>
            </div>
        )
    }
}
interface NewProtocolModalProps {
    isOpen: boolean;
}

interface NewProtocolModalState {
    protocol_number: string;
    approval_date: Moment;
    isSaving: boolean;
}



class NewProtocolModal extends React.Component<NewProtocolModalProps, NewProtocolModalState> {
    private $modalDiv: JQuery;
    private selectedDate = ko.observable(moment());

    constructor(props: NewProtocolModalProps) {
        super(props);

        this.state = {
            protocol_number: '',
            approval_date: this.selectedDate(),
            isSaving: false
        };

        this.selectedDate.subscribe((val) => {
            this.setState({
                approval_date: val
            });
        });

        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.handleProtocolNumberChange = this.handleProtocolNumberChange.bind(this);
        this.submit = this.submit.bind(this);
    }

    componentDidMount(): void {
        (this.props.isOpen) ? this.show() : this.hide();
    }

    componentDidUpdate(): void {
        (this.props.isOpen) ? this.show() : this.hide();
    }

    show(): void {
        this.$modalDiv && (this.$modalDiv as any).modal('show');
    }

    hide(): void {
        this.$modalDiv && (this.$modalDiv as any).modal('hide')
    }

    handleProtocolNumberChange(e: ChangeEvent<HTMLInputElement>): void {
        this.setState({protocol_number: e.target.value});
    }

    submit(): void {
        let state: NewProtocolModalState = this.state;
        let form: NewProtocolForm = new NewProtocolForm();
        form.id = state.protocol_number;
        form.approval_date = state.approval_date;

        this.setState({
            isSaving: true
        });

        let postURL = buildURL('wnprc_compliance-protocol-api', 'newProtocol', getCurrentContainer());

        api.postJSON(postURL, form, {}).then((jsonData: any) => {
            let data = jsonData as NewProtocolResponse;

            this.hide();
            toastr.success("Successfully saved new protocol.");
        }).catch((e) => {
            console.log(e.message, e);

            alert("failed");
        }).finally(() => {
            this.setState({
                isSaving: false
            });
        })
    }

    render() {
        return (
            <div className="modal fade" ref={(div) => { this.$modalDiv = $(div); }} tabIndex={-1} role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" {...{'data-dismiss': "modal", 'aria-label': "Close"}}><span aria-hidden="true">&times;</span></button>
                            <h3 className="modal-title">New Protocol</h3>
                        </div>

                        <div className="modal-body">
                            <fieldset className="form-horizontal">
                                <div className="form-group">
                                    <label className="col-sm-3">Protocol Number</label>
                                    <div className="col-sm-9">
                                        <input className="form-control" type="text" value={this.state.protocol_number || ''} onChange={this.handleProtocolNumberChange}/>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="col-sm-3">Approval Date</label>
                                    <div className="col-sm-9">
                                        <DateSelector initialDate={this.selectedDate} />
                                    </div>
                                </div>
                            </fieldset>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-default" {...{'data-dismiss': "modal"}}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={this.submit}>Create New Protocol</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

interface PageState {
    modalOpen: boolean;
}

class Page extends React.Component<{}, PageState> {
    constructor(props: {}) {
       super(props);

       this.state = {
           modalOpen: false
       };

       this.openModal = this.openModal.bind(this);
       this.closeModal = this.closeModal.bind(this);
    }

    openModal(): void {
        this.setState({modalOpen: true})
    }

    closeModal(): void {
        this.setState({modalOpen: false})
    }

    render() {
        return (
            <div>
                <NewProtocolModal isOpen={this.state.modalOpen} handleClose={() => {this.closeModal()}} />

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
                        <div className="panel panel-primary container-fluid">
                            <div className="panel-heading row">
                                Protocol List
                                <div className="pull-right">
                                    <button className="btn btn-success" onClick={this.openModal}>
                                        <i className="fa fa-plus" style={{marginRight: '5px'}}/> New
                                    </button>
                                </div>

                            </div>

                            <div className="panel-body">
                                <h1>The list of protocols will go here...</h1>
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
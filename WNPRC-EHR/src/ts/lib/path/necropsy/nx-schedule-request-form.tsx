import * as React from "react";
import Component = React.Component;
import * as moment from "moment";
import Moment = moment.Moment;
import {YearSelector, DateTimeSelector} from "../../DatePicker";
import {
    ScheduleNecropsyForm, NecropsyRequestDetailsForm,
    RequestStaticInfo, NecropsySuiteInfo
} from "../../../../../build/generated-ts/GeneratedFromJava";
import {buildURLWithParams, getCurrentContainer} from "WebUtils/LabKey";
import {getNecropsyRequestDetails, NecropsySuites, Pathologists} from "./nx-api";
import * as _ from "underscore";
import ChangeEvent = React.ChangeEvent;
import {UserSelector} from "../../UserSelector";

export interface NxScheduleRequestFormPanelProps {
    necropsyLsid: string | null;
    clearForm?: () => void;
}

interface NxScheduleRequestFormPanelState {
    isLoading: boolean;
    form: ScheduleNecropsyForm;
    info: RequestStaticInfo;
    locations: NecropsySuiteInfo[];
    pathologists: Pathologist[];
}

interface Pathologist {
    id: string;
    displayname: string;
}

export class NxScheduleRequestFormPanel extends Component<NxScheduleRequestFormPanelProps, NxScheduleRequestFormPanelState> {
    constructor(props: NxScheduleRequestFormPanelProps) {
        super(props);

        this.state = {
            isLoading: false,
            form: new ScheduleNecropsyForm(),
            info: new RequestStaticInfo(),
            locations: [],
            pathologists: []
        };

        this.handleDateChange = this.handleDateChange.bind(this);
        this.handlePathologistChange = this.handlePathologistChange.bind(this);
        this.handleProsectorChange = this.handleProsectorChange.bind(this);
        this.handleLocationChange = this.handleLocationChange.bind(this);
        this.handleAssignedToChange = this.handleAssignedToChange.bind(this);
    }

    componentDidMount() {
        if (this.props.necropsyLsid != null) {
            this.load();
        }

        NecropsySuites.then((locations: NecropsySuiteInfo[]) => {
            this.setState({locations});
        });

        Pathologists.then((map: {[name: string]: string}) => {
            let pathologists = [];

            for (let id in map) {
                pathologists.push({
                    id,
                    displayname: map[id]
                })
            }

            this.setState({pathologists});
        })
    }

    componentWillReceiveProps(nextProps: NxScheduleRequestFormPanelProps) {
        if (nextProps.necropsyLsid != this.props.necropsyLsid) {
            this.load(nextProps.necropsyLsid);
        }
    }

    load(optionalLsid?: string | null) {
        let lsid: string | null = !_.isUndefined(optionalLsid) ? optionalLsid as string | null : this.props.necropsyLsid;

        if (lsid != null) {
            this.setState({
                isLoading: true
            }, () => {
                if (lsid != null) {
                    getNecropsyRequestDetails(lsid).then((response: NecropsyRequestDetailsForm) => {
                        let form: ScheduleNecropsyForm = response.form;
                        let info: RequestStaticInfo = response.staticInfo;

                        this.setState({
                            form,
                            info,
                            isLoading: false
                        });
                    });
                }
            });
        }
    }

    handleDateChange(newDate: Moment) {
        let form = this.state.form;
        form.scheduledDate = newDate;
        this.setState({form});
    }

    handleLocationChange(e: ChangeEvent<HTMLSelectElement>) {
        let form = this.state.form;
        form.location = e.target.value;
        this.setState({
            form
        });
    }

    handlePathologistChange(e: ChangeEvent<HTMLSelectElement>) {
        let form = this.state.form;
        form.pathologist = parseInt(e.target.value);
        this.setState({
            form
        });
    }

    handleProsectorChange(e: ChangeEvent<HTMLSelectElement>) {
        let form = this.state.form;
        form.assistant = parseInt(e.target.value);
        this.setState({
            form
        });
    }

    handleAssignedToChange(val: number) {
        let form = this.state.form;
        form.assignedTo = val;
        this.setState({
            form
        });
    }

    render() {
        let requestURL = buildURLWithParams('ehr', 'dataEntryFormDetails', getCurrentContainer(), {
            formType: 'NecropsyRequest',
            requestId: this.props.necropsyLsid || ""
        });

        let form = (this.state.isLoading || (this.state.form == null)) ? null : (
            <fieldset className="form-horizontal">
                <div className="form-group">
                    <label className="col-xs-4 control-label">Request ID</label>
                    <div className="col-xs-8">
                        <p className="form-control-static">
                            <a href={requestURL}>
                                {this.state.info.requestid}
                            </a>
                            <span> ({this.state.info.priority})</span>
                        </p>
                    </div>
                </div>

                <div className="form-group">
                    <label className="col-xs-4 control-label">Animal ID</label>
                    <div className="col-xs-8">
                        <p className="form-control-static">{this.state.info && this.state.info.animalid}</p>
                    </div>
                </div>

                <div className="form-group">
                    <label className="col-xs-4 control-label">Comments</label>
                    <div className="col-xs-8">
                        <p className="form-control-static">{this.state.info && this.state.info.comments}</p>
                    </div>
                </div>

                <div className="form-group">
                    <label className="col-xs-4 control-label">Date</label>
                    <div className="col-xs-8">
                        <DateTimeSelector initialMoment={this.state.form.scheduledDate} handleUpdate={this.handleDateChange}/>
                    </div>
                </div>


                <div className="form-group">
                    <label className="col-xs-4 control-label">Location</label>
                    <div className="col-xs-8">
                        <select className="form-control" value={this.state.form.location || ''} onChange={this.handleLocationChange}>
                            <option value=""></option>
                            {this.state.locations.map((suite: NecropsySuiteInfo, i: number) => {
                                return (
                                    <option value={suite.roomCode} key={i}>{suite.roomCode}</option>
                                )
                            })}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="col-xs-4 control-label">Pathologist</label>
                    <div className="col-xs-8">
                        <select className="form-control" value={this.state.form.pathologist || ''} onChange={this.handlePathologistChange}>
                            <option value=""></option>
                            {this.state.pathologists.map((pathologist: Pathologist, i: number) => {
                                return (
                                    <option key={i} value={pathologist.id}>{pathologist.displayname}</option>
                                )
                            })}
                        </select>
                    </div>
                </div>


                <div className="form-group">
                    <label className="col-xs-4 control-label">Prosector</label>
                    <div className="col-xs-8">
                        <select className="form-control" value={this.state.form.assistant || ''} onChange={this.handleProsectorChange}>
                            <option value=""></option>
                            {this.state.pathologists.map((pathologist: Pathologist, i: number) => {
                                return (
                                    <option key={i} value={pathologist.id}>{pathologist.displayname}</option>
                                )
                            })}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="col-xs-4 control-label">Assigned To</label>
                    <div className="col-xs-8">
                        <UserSelector initialUser={this.state.form.assignedTo} onChange={this.handleAssignedToChange} />
                    </div>
                </div>

            </fieldset>
        );

        return (
            <div className="panel panel-primary">
                <div className="panel-heading">Schedule Request</div>

                <div className="panel-body">

                    {(this.state.isLoading) ? (
                        <div>
                            <p><em>Loading...</em></p>
                        </div>
                    ) : (this.props.necropsyLsid == null) ? (
                        <div>
                            <p><em>Please select a pending request.</em></p>
                        </div>
                    ) : (
                        <div>
                            {form}

                            <div style={{"textAlign": "right"}}>
                                {
                                    (this.props.clearForm) && (
                                        <button className="btn btn-default" onClick={this.props.clearForm}>Cancel</button>
                                    )
                                }
                                <button className="btn btn-primary">Schedule Necropsy</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
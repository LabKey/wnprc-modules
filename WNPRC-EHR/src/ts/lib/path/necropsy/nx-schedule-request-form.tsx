import * as React from "react";
import Component = React.Component;
import * as moment from "moment";
import Moment = moment.Moment;
import {YearSelector} from "../../DatePicker";
import {
    ScheduleNecropsyForm, NecropsyRequestDetailsForm,
    RequestStaticInfo
} from "../../../../../build/generated-ts/GeneratedFromJava";
import {buildURLWithParams, getCurrentContainer} from "WebUtils/LabKey";
import {getNecropsyRequestDetails} from "./nx-api";
import * as _ from "underscore";

export interface NxScheduleRequestFormPanelProps {
    necropsyLsid: string | null;
}

interface NxScheduleRequestFormPanelState {
    isLoading: boolean;
    form: ScheduleNecropsyForm;
    info: RequestStaticInfo;
}

export class NxScheduleRequestFormPanel extends Component<NxScheduleRequestFormPanelProps, NxScheduleRequestFormPanelState> {
    constructor(props: NxScheduleRequestFormPanelProps) {
        super(props);

        this.state = {
            isLoading: false,
            form: new ScheduleNecropsyForm(),
            info: new RequestStaticInfo()
        };
    }

    componentDidMount() {
        if (this.props.necropsyLsid != null) {
            this.load();
        }
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
                        <YearSelector />
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
                        form
                    )}
                </div>
            </div>
        );
    }
}
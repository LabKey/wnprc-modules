import * as React from "react";
import Component = React.Component;
import * as moment from "moment";
import Moment = moment.Moment;
import {YearSelector} from "../../DatePicker";

export interface NxScheduleRequestFormPanelProps {
    necropsyLsid: string | null;
}

interface RequestInfo {
    animalid: string;
    comments: string;
}

class RequestForm {

}

interface NxScheduleRequestFormPanelState {
    isLoading: boolean;
    form: RequestForm;
    info: RequestInfo | null;
}

export class NxScheduleRequestFormPanel extends Component<NxScheduleRequestFormPanelProps, NxScheduleRequestFormPanelState> {
    constructor(props: NxScheduleRequestFormPanelProps) {
        super(props);

        this.state = {
            isLoading: false,
            form: new RequestForm(),
            info: null
        };
    }

    render() {
        let form = (this.state.isLoading) ? null : (
            <fieldset className="form-horizontal">
                <div className="form-group">
                    <label className="col-xs-4 control-label">Request ID</label>
                    <div className="col-xs-8">
                        <p className="form-control-static">
                            <a href="#">
                                {this.props.necropsyLsid}
                            </a>
                            <span>
                            [priority]
                        </span>
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

                    {(this.props.necropsyLsid == null) ? (
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
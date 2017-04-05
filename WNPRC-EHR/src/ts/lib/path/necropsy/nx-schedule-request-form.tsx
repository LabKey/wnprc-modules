import * as React from "react";
import Component = React.Component;
import * as moment from "moment";
import Moment = moment.Moment;

export interface NxScheduleRequestFormPanelProps {
    necropsyLsid: string | null;
}

interface NxScheduleRequestFormPanelState {

}

export class NxScheduleRequestFormPanel extends Component<NxScheduleRequestFormPanelProps, NxScheduleRequestFormPanelState> {
    render() {
        return (
            <div className="panel panel-primary">
                <div className="panel-heading">Schedule Request</div>

                <div className="panel-body">
                    TODO
                </div>
            </div>
        );
    }
}
import * as React from "react";
import Component = React.Component;
import * as moment from "moment";
import Moment = moment.Moment;

interface NxPendingRequestsPanelState {

}

export class NxPendingRequestsPanel extends Component<{}, NxPendingRequestsPanelState> {
    render() {
        return (
            <div className="panel panel-primary">
                <div className="panel-heading">Pending Requests</div>

                <div className="panel-body">
                    TODO
                </div>
            </div>
        );
    }
}
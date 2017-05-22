import * as React from "react";
import * as ReactDOM from "react-dom";
import Component = React.Component;
import * as moment from "moment";
import Moment = moment.Moment;
import {NxDetailsPanel} from "../lib/path/necropsy/nx-details-panel";
import {NxCalendar} from "../lib/path/necropsy/nx-calendar";
import {NxPendingRequestsPanel} from "../lib/path/necropsy/nx-pending-requests";
import {NxScheduleRequestFormPanel} from "../lib/path/necropsy/nx-schedule-request-form";

interface PageState {
    selectedNxLsid: string | null;
    selectedNxRequestLsid: string | null;
}

let global = window as any;
let isPathologist: boolean = ('isPathologist' in global.PageLoadData) ? global.PageLoadData.isPathologist : false;

class Page extends Component<{}, PageState> {
    r$calendar: NxCalendar;
    r$requests: NxPendingRequestsPanel;

    constructor(props: {}) {
        super(props);

        this.state = {
            selectedNxLsid: null,
            selectedNxRequestLsid: null
        };

        this.handleEventClick = this.handleEventClick.bind(this);
        this.handleSelectLsid = this.handleSelectLsid.bind(this);
        this.handleSelectLsid = this.handleSelectLsid.bind(this);
        this.handleScheduleSuccess = this.handleScheduleSuccess.bind(this);
    }

    handleEventClick(nxLsid: string) {
        this.setState({
            selectedNxLsid: nxLsid
        });
    }

    handleSelectLsid(rowData: any) {
        this.setState({
            selectedNxRequestLsid: rowData.lsid
        });
    }

    handleScheduleSuccess() {
        if (this.r$calendar) {
            this.r$calendar.refresh();
        }

        if (this.r$requests) {
            this.r$requests.reload();
        }
    }

    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12 col-xl-8">
                        <div className="col-sm-12 col-md-4">
                            <NxDetailsPanel necropsyLsid={this.state.selectedNxLsid} isPathologist={isPathologist}/>
                        </div>

                        <div className="col-sm-12 col-md-8">
                            <NxCalendar handleClick={this.handleEventClick} ref={(el) => {this.r$calendar = el}}/>
                        </div>
                    </div>

                    {isPathologist && (
                        <div className="col-sm-12 col-xl-8">
                            <div className="col-sm-12 col-md-8">
                                <NxPendingRequestsPanel handleClick={this.handleSelectLsid} ref={(el) => {this.r$requests = el}} />
                            </div>

                            <div className="col-sm-12 col-md-4">
                                <NxScheduleRequestFormPanel necropsyLsid={this.state.selectedNxRequestLsid}
                                                            clearForm={() => {this.setState({selectedNxRequestLsid: null})}}
                                                            handleSchedule={this.handleScheduleSuccess}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}


// Render the page into the react div
ReactDOM.render(
    <Page />,
    $("#reactDiv").get(0)
);
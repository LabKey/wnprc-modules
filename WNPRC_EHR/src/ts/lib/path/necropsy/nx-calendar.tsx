import * as React from "react";
import Component = React.Component;
import * as moment from "moment";
import Moment = moment.Moment;
import * as api from "WebUtils/API";
import { URLForAction } from "WebUtils/GeneratedFromJava";
import { urlFromAction } from "WebUtils/LabKey";
import {
    ScheduledNecropsiesForm, NecropsyEventForm,
    NecropsySuiteInfo
} from "GeneratedFromJava";
import {NecropsySuites} from "./nx-api";

require("fullcalendar");

export interface NxCalendarProps {
    handleClick?: (nxLsid: string) => void
}

interface NxCalendarState {
    isLoading: boolean,
    suites: NecropsySuiteInfo[]
}

interface CalendarEvent {
    title: string,
    start: Moment,
    otherData?: any,
    color?: string
}

const eventsListURL: URLForAction = new URLForAction();
eventsListURL.controller = 'wnprc_ehr-necropsy';
eventsListURL.actionName = 'getScheduledNecropsies';

export class NxCalendar extends Component<NxCalendarProps, NxCalendarState> {
    _calDiv: HTMLDivElement;

    constructor(props: NxCalendarProps) {
        super(props);

        this.state = {
            isLoading: false,
            suites: []
        };


        NecropsySuites.then((suites: NecropsySuiteInfo[]) => {
            this.setState({ suites });
        })
    }

    componentDidMount() {
        let self = this;
        let $calendar = $(this._calDiv);

        ($calendar as any).fullCalendar({
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,agendaWeek'
            },
            events: (startMoment: Moment, endMoment: Moment, timezone: any, callback: (events: CalendarEvent[]) => void) => {
                let url: string = urlFromAction(eventsListURL, {
                    start: startMoment.format('Y-MM-DD'),
                    end:   endMoment.format('Y-MM-DD')
                });

                this.setState({isLoading: true}, () => {
                    api.getJSON(url, {}).then((data: any) => {
                        let eventsData = ScheduledNecropsiesForm.fromJSON(data);

                        callback(eventsData.scheduledNecropsies.map((val: NecropsyEventForm) => {
                            let event: CalendarEvent = {
                                title: val.animalId,
                                start: val.scheduledDate
                            };

                            if (val.color) {
                                event.color = val.color;
                            }

                            event.otherData = {
                                lsid: val.lsid
                            };

                            return event;
                        }));

                        this.setState({isLoading: false});
                    });
                })
            },
            eventClick: function(calEvent: CalendarEvent) {
                if (self.props.handleClick) {
                    self.props.handleClick(calEvent.otherData.lsid);
                }
            }
        });

        $('.hiddenDiv').on('hiddendiv.show', () => {
            ($calendar as any).fullCalendar('render');
        })
    }

    refresh() {
        let $calendar = $(this._calDiv);
        ($calendar as any).fullCalendar('refetchEvents');
    }

    render() {
        return (
            <div className="panel panel-primary">
                <div className="panel-heading">
                    Calendar

                    {(this.state.isLoading) && (
                        <div className="pull-right">
                            <i className="fa fa-spinner fa-pulse fa-fw"></i>
                        </div>
                    )}
                </div>

                <div className="panel-body">
                    <div ref={(div) => {if (div != null) {this._calDiv = div;}}}></div>

                    {this.state.suites.length > 0 && (
                        <div className="pull-right">
                            {this.state.suites.map((suite: NecropsySuiteInfo, i: number) => {
                                return (
                                    <span key={i} style={{marginRight: '5px'}}>
                                        <span style={{color: suite.color}}>&#x2589;</span><span>{suite.suiteName || suite.roomCode}</span>
                                    </span>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        )
    }
}
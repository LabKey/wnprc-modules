import * as React from "react";
import Component = React.Component;
import * as moment from "moment";
import Moment = moment.Moment;
import * as api from "WebUtils/API";
import {URLForAction} from "../../../../../lkpm/modules/WebUtils/build/generated-ts/GeneratedFromJava";
import {urlFromAction} from "../../../../../lkpm/modules/Compliance/lkpm/modules/WebUtils/src/ts/WebUtils/LabKey";
import {ScheduledNecropsiesForm, NecropsyEventForm} from "../../../../../build/generated-ts/GeneratedFromJava";

export interface NxCalendarProps {
    handleClick?: (nxLsid: string) => void
}

interface NxCalendarState {
    isLoading: boolean
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
            isLoading: false
        };
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
                    <div ref={(div) => {this._calDiv = div;}}></div>
                </div>
            </div>
        )
    }
}
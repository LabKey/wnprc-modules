import * as React from "react";
import * as ReactDOM from "react-dom";
import moment = require("moment");
import Moment = moment.Moment;

interface DateSelectorProps {
    initialDate?: Moment | KnockoutObservable<Moment>;
    format: string;
    isEqual: (curDate: Moment, nextDate: Moment) => boolean;
    handleUpdate?: (newDate: Moment) => void;
}

interface DateSelectorState {
    date: Moment
}

class DateSelector extends React.Component<DateSelectorProps, DateSelectorState> {
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
            date: this.selectedDate()
        };

        this.selectedDate.subscribe((val) => {
            this.setState({date: val});
            this.getInputElement().data("DateTimePicker").date(this.state.date);
        });

        this.toggle = this.toggle.bind(this);
    }

    componentDidMount() {
        this.init();
    }

    init() {
        // Initialize the DateTimePicker
        (this.getInputElement() as any).datetimepicker({
            format: this.props.format
        });

        this.getInputElement().on("dp.change", (e: Event) => {
            if ('date' in e) {
                let date = (e as any).date as any;

                if (date != null && moment.isMoment(date)) {
                    if (!this.props.isEqual(this.state.date, date)) {
                        this.selectedDate(date);

                        if (this.props.handleUpdate) {
                            this.props.handleUpdate(date);
                        }
                    }
                }
            }
        });

        // Set the current value
        this.getInputElement().data("DateTimePicker").date(this.state.date);
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

export interface YearSelectorProps {
    initialYear?: Moment | KnockoutObservable<Moment>;
}

export class YearSelector extends React.Component<YearSelectorProps, {}> {
    render() {
        let isSame = (curDate: moment.Moment, nextDate: moment.Moment): boolean => {
            return curDate.isSame(nextDate, 'year');
        };

        return (
            <DateSelector format="YYYY" initialDate={this.props.initialYear} isEqual={isSame} />
        );
    }
}


export interface DaySelectorProps {
    initialDay?: Moment | KnockoutObservable<Moment>;
    handleUpdate?: (newDate: Moment) => void;
}

export class DaySelector extends React.Component<DaySelectorProps, {}> {
    render() {
        let isSame = (curDate: moment.Moment, nextDate: moment.Moment): boolean => {
            return curDate.isSame(nextDate, 'day');
        };

        return (
            <DateSelector format="YYYY-MM-DD" initialDate={this.props.initialDay} isEqual={isSame} handleUpdate={this.props.handleUpdate}/>
        );
    }
}

export interface DateTimeSelectorProps {
    initialMoment?: Moment | KnockoutObservable<Moment>;
    handleUpdate?: (newDate: Moment) => void;
}


export class DateTimeSelector extends React.Component<DateTimeSelectorProps, {}> {
    render() {
        let isSame = (curDate: moment.Moment, nextDate: moment.Moment): boolean => {
            return curDate.isSame(nextDate, 'minute');
        };

        return (
            <DateSelector format="YYYY-MM-DD HH:mm" initialDate={this.props.initialMoment} isEqual={isSame} handleUpdate={this.props.handleUpdate}/>
        );
    }
}
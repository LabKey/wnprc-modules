import * as React from "react";
import * as ReactDOM from "react-dom";
import moment = require("moment");
import Moment = moment.Moment;

export interface YearSelectorProps {
    initialYear?: Moment | KnockoutObservable<Moment>
}

export interface YearSelectorState {
    year: Moment
}

export class YearSelector extends React.Component<YearSelectorProps, YearSelectorState> {
    selectedDate: KnockoutObservable<Moment>;

    constructor(props: YearSelectorProps) {
        super(props);

        // Set a default
        this.selectedDate = ko.observable(moment());

        // If we were passed an observable, use that.  If we were passed a moment, just update our selected date
        // to reflect that value.
        if (this.props && this.props.initialYear) {
            if (ko.isObservable(this.props.initialYear)) {
                this.selectedDate = this.props.initialYear;
            }
            else {
                this.selectedDate(this.props.initialYear);
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
            format: 'YYYY'
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
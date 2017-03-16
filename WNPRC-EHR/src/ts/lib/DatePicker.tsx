import * as React from "react";
import * as ReactDOM from "react-dom";
import moment = require("../../../node_modules/lkpm/node_modules/moment/moment");
import Moment = moment.Moment;

export interface YearSelectorProps {
    initialYear?: Moment
}

export interface YearSelectorState {
    year: Moment
}

export class YearSelector extends React.Component<YearSelectorProps, YearSelectorState> {
    constructor() {
        super();

        this.state = {
            year: (this.props && this.props.initialYear) ? this.props.initialYear : moment()
        };

        this.toggle = this.toggle.bind(this);
    }

    componentDidMount() {
        this.init();
    }

    init() {
        // Initialize the DateTimePicker
        this.getInputElement().datetimepicker({
            format: 'YYYY'
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
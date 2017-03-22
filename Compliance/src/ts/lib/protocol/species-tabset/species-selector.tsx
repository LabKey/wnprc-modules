import * as React from "react";
import ChangeEvent = React.ChangeEvent;
import MouseEvent  = React.MouseEvent;
import * as _ from "underscore";

export interface SpeciesSelectorProps {
    options: {[name: string]: string};
    selectedSpecies: KnockoutObservableArray<string>;
    handleButtonClick?(optionValue: string): void;
}

interface SpeciesSelectorState {
    value: string
}

export class SpeciesSelector extends React.Component<SpeciesSelectorProps, SpeciesSelectorState> {
    constructor(props: SpeciesSelectorProps) {
        super(props);

        this.state = {value: ""};

        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    handleChange(e: ChangeEvent<HTMLSelectElement>) {
        this.setState({
            value: e.target.value
        });
    }

    handleClick(e: MouseEvent<HTMLButtonElement>) {
        if (this.props.handleButtonClick) {
            this.props.handleButtonClick(this.state.value);
        }

        e.preventDefault();
    }

    render() {
        let options = _.keys(this.props.options).filter((keyName: string) => {
            return this.props.selectedSpecies.indexOf(keyName) === -1;
        }).map((keyName: string) => {
            return (
                <option key={keyName} value={keyName}>{this.props.options[keyName]}</option>
            );
        });

        return (
            <form className="form-inline">
                <div className="form-group">
                    <select value={this.state.value} onChange={this.handleChange} className="form-control" placeholder="Please Select a Species">
                        <option value="" style={{fontStyle: 'italic'}}>Please Select a Species</option>
                        {options}
                    </select>
                </div>

                <button style={{marginLeft: '5px'}} disabled={this.state.value == ""} className="btn btn-primary" onClick={this.handleClick}>Add Species</button>
            </form>
        )
    }
}
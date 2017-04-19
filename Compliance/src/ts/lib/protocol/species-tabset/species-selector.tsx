import * as React from "react";
import ChangeEvent = React.ChangeEvent;
import MouseEvent  = React.MouseEvent;
import * as _ from "underscore";
import {getSpeciesClassValues, SpeciesClass} from "../../../../../build/generated-ts/GeneratedFromJava";
import * as s from "underscore.string";

const all_species: SpeciesClass[] = getSpeciesClassValues();

export interface SpeciesSelectorProps {
    alreadySelected: SpeciesClass[];
    handleButtonClick?(optionValue: string): void;
}

interface SpeciesSelectorState {
    value: SpeciesClass | "";
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
            value: e.target.value as SpeciesClass | ""
        });
    }

    handleClick(e: MouseEvent<HTMLButtonElement>) {
        if (this.props.handleButtonClick) {
            this.props.handleButtonClick(this.state.value);
        }

        this.setState({value: ""});

        e.preventDefault();
    }

    render() {
        let options = _.difference(all_species, this.props.alreadySelected).map((keyName: SpeciesClass | "") => {
            return (
                <option key={keyName} value={keyName}>{s.titleize(keyName.split('_').join(' '))}</option>
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
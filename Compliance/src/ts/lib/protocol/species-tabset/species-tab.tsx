import {SpeciesProtocolInfo, SpeciesFlagNames, SpeciesFlags} from "../protocol";
import * as React from "react";
import ChangeEvent = React.ChangeEvent;
import {CheckBoxSet} from "../../checkboxset";
import {DrugsSection} from "./drugs-section";
import {DrugRegimensSection} from "./drug-regimen-section";

class SpeciesCheckboxSet extends CheckBoxSet<SpeciesFlagNames> {}

export interface ProtocolSpeciesTabProps {
    info: SpeciesProtocolInfo
}

export interface ProtocolSpeciesTabState {
    info: SpeciesProtocolInfo
}

export class ProtocolSpeciesTab extends React.Component<ProtocolSpeciesTabProps, ProtocolSpeciesTabState> {
    constructor(props: ProtocolSpeciesTabProps) {
        super(props);

        this.state = {
            info: props.info
        };

        let flags: SpeciesFlags = this.state.info.flags;
        flags.registerListener(() => {
            this.forceUpdate();
        });

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e: ChangeEvent<HTMLInputElement>) {
        this.props.info.max_number_of_animals = parseInt(e.target.value);
        this.forceUpdate();
    }

    render() {
        return (
            <div>
                <div className="row">
                    <div className="form-group">
                        <label className="col-sm-3 control-label">Max Number of Animals</label>
                        <div className="col-sm-9">
                            <input value={this.state.info.max_number_of_animals} className="form-control" type="number" min="0" onChange={this.handleChange} />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-sm-12">
                        <SpeciesCheckboxSet title="What will be done to this species?" flags={this.state.info.flags} />
                    </div>
                </div>

                {this.state.info.flags.getFlag("drug_administration") && (<DrugsSection />)}
                {this.state.info.flags.getFlag("drug_administration") && (<DrugRegimensSection />)}
            </div>
        )
    }
}
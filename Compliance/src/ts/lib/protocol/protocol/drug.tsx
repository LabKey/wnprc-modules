import * as React from "react";
import ChangeEvent = React.ChangeEvent;

const uuidv4 = require("uuid/v4");

export class Drug {
    id: string;
    snomed_code: string = '';
    dose_amount: number;
    dose_units: string;
    frequency_description: string;
    substance_type: string;

    constructor() {
        this.id = uuidv4();
    }
}

export interface DrugFormProps {
    drug: Drug
}

interface DrugFormState {
    drug: Drug
}

export class DrugForm extends React.Component<DrugFormProps, DrugFormState> {
    constructor(props: DrugFormProps) {
        super(props);

        this.state = {
            drug: props.drug
        };

        this.handleSnomedChange = this.handleSnomedChange.bind(this);
        this.handleSubstanceChange = this.handleSubstanceChange.bind(this);
    }

    handleSnomedChange(e: ChangeEvent<HTMLInputElement>) {
        let drug = this.state.drug;
        drug.snomed_code = e.target.value;

        this.setState({
            drug: drug
        });
    }


    handleSubstanceChange(e: ChangeEvent<HTMLInputElement>) {
        let drug = this.state.drug;
        drug.substance_type = e.target.value;

        this.setState({
            drug: drug
        });
    }

    handleDoseChange(e: ChangeEvent<HTMLInputElement>) {
        let drug: Drug = this.state.drug;
        drug.dose_amount = parseFloat(e.target.value);

        this.setState({
            drug: drug
        });
    }

    handleDoseUnitChange(e: ChangeEvent<HTMLInputElement>) {
        let drug: Drug = this.state.drug;
        drug.dose_units = e.target.value;

        this.setState({
            drug: drug
        });
    }

    render() {
        let drug = this.props.drug;

        return (
            <div key={drug.id} className="container-fluid">
                <div className="row">
                    <span>{drug.id}</span>
                </div>


                <div className="row">
                    <div className="col-sm-6 form-horizontal">
                        <div className="form-group">
                            <label className="col-sm-6 control-label">Snomed Code:</label>
                            <div className="col-sm-6">
                                <input value={drug.snomed_code || ''} className="form-control" type="text" onChange={this.handleSnomedChange} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="col-sm-6 control-label">Dose:</label>
                            <div className="col-sm-6">
                                <input value={drug.dose_amount || ''} className="form-control" type="text" onChange={this.handleDoseChange} />
                                <input value={drug.dose_units || ''} className="form-control" type="text" onChange={this.handleDoseUnitChange} />
                            </div>
                        </div>
                    </div>


                    <div className="col-sm-6 form-horizontal">
                        <div className="form-group">
                            <label className="col-sm-6 control-label">Substance Type:</label>
                            <div className="col-sm-6">
                                <input value={drug.substance_type || ''} className="form-control" type="text" onChange={this.handleSubstanceChange} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="form-group">
                        <label className="control-label">Frequency Notes</label>
                        <textarea className="form-control" rows={3} />
                    </div>
                </div>
            </div>
        );
    }
}
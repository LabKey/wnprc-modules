import * as React from "react";
import Component = React.Component;
import ChangeEvent = React.ChangeEvent;
import CSSProperties = React.CSSProperties;

import * as s from "underscore.string";

export interface TextInputProps {
    property_name: string;
    label?: string;
    handleChange?(label: string, val: string): void;
    editable: boolean;
    value: string;
}


export class TextInput extends Component<TextInputProps, {}> {
    constructor(props: TextInputProps) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e: ChangeEvent<HTMLInputElement>) {
        if (this.props.handleChange) {
            this.props.handleChange(this.props.property_name, e.target.value);
        }
    }

    render() {
        let pStyle: CSSProperties = {
            whiteSpace: 'pre-line',
            overflow: 'hidden'
        };

        if (s.isBlank(this.props.value)) {
            pStyle['fontStyle'] = 'italic';
            pStyle['color'] = 'grey';
        }

        return (
            <div className="form-group" style={{marginBottom: '5px'}} key={this.props.property_name}>
                <label className="col-sm-3 control-label">{this.props.label || this.props.property_name}</label>
                <div className="col-sm-9">
                    {
                        (this.props.editable) ? (
                            <input value={this.props.value} className="form-control" type="text" onChange={this.handleChange} />
                        ) : (
                            <p style={pStyle} className="form-control-static">
                                {s.isBlank(this.props.value) ? 'None Specified' : this.props.value}
                            </p>
                        )
                    }

                </div>
            </div>
        )
    }
}
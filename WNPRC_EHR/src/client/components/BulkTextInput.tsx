//bulk rows add to component will need onChange handler and state management. Pass in names count number for cnt
import * as React from 'react';
import { FC } from 'react';
import "../theme/css/index.css";
import InputLabel from './InputLabel';
import TextInput from './TextInput';
import Checkbox from './Checkbox';

interface BulkTextProps {
    inputField: any[];
    state: any;
    handleInputChange: any;
    required: number[];
}
/*
Creates forms
@props inputField array of rows that describe themselves
@props state State management for form/row
@props handleInputChange Handler for changing inputs
@props required determines if the row is required or not

 */
const BulkTextInput: FC<BulkTextProps> = (props) => {
    const {inputField, state,handleInputChange, required} = props;

    const cnt = inputField.length;

    const inputs = [];


    // Go through fields assigning divs depending on types
    // Date, Text, TextArea, Checkbox, Dropdown,
    for (let i = 0; i < cnt; i++) {
        const id = `id_${i}`;
        let name = inputField[i].name;
        let label = inputField[i].label;
        const isRequired = required.includes(i);
        let fieldType = inputField[i].type;

        // Text field
        if(fieldType === "text"){
            inputs.push(
                <div key={id} className={"panel-input-row"}>
                    <InputLabel
                        labelFor={id}
                        label={label}
                        className = {'panel-label'}
                    />
                    <TextInput
                        name={name}
                        id={id}
                        className="form-control"
                        value={state[name] || ''}
                        onChange={handleInputChange}
                        required={isRequired}
                        autoFocus={false}
                    />
                </div>
            );
        }
        else if(fieldType === "textarea") { // Text Area field
            inputs.push(
                <div key={id} className="panel-input-row">
                    <InputLabel
                        labelFor={id}
                        label={label}
                        className={"panel-label"}
                    />
                    <textarea
                        name={name}
                        id={id}
                        className="form-control"
                        rows={3}
                        value={state[name]}
                        onChange={handleInputChange}
                        required={isRequired}
                        autoFocus={false}
                    />
                </div>
            );
        }
        else if(fieldType === "checkbox") { // Checkbox field
            inputs.push(
                <div key={id} className={"panel-input-row"}>
                    <InputLabel
                        labelFor={id}
                        label={label}
                        className={"panel-label"}
                    />
                    <Checkbox
                        name={name}
                        id={id}
                        className="form-control"
                        value={state[name]}
                        onChange={handleInputChange}
                        required={false}
                    />
            </div>
            );
        }
    }
    return (<>{inputs}</>);
}
export default BulkTextInput;

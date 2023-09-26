import * as React from 'react';
import { FC } from 'react';
import "../theme/css/index.css";
import InputLabel from './InputLabel';
import TextInput from './TextInput';
import Checkbox from './Checkbox';
import DropdownSearch from './DropdownSearch';
import ControlledDateInput from './ControlledDateInput';
import TextAreaInput from './TextAreaInput';
import { FieldPathValue, FieldValues, useFormContext } from 'react-hook-form';

interface BulkFormProps {
    inputField: any[];
    compName: string;
    prevForm: any;
    dropdownOptions?: any;
}
/*
Form creation helper
@props inputField array of fields that describe themselves
@props prevForm object describing the previous form data if needed
@props dropdownOptions function for obtaining the options needed for dropdown menus
@props compName string for the name of the component that the fields belong to

 */
const BulkFormInput: FC<BulkFormProps> = (props) => {
    const {inputField, prevForm, dropdownOptions, compName} = props;
    const {watch} = useFormContext();

    const inputs = [];

    // Go through fields assigning divs depending on types
    // Date, Text, TextArea, Checkbox, Dropdown,
    for (let i = 0; i < inputField.length; i++) {
        const id = `${compName}_${i}`;
        const name = inputField[i].name;
        const label = inputField[i].label;
        const isRequired = inputField[i].required;
        const fieldType = inputField[i].type;
        const validation = inputField[i].validation;
        const watchVar = inputField[i].watch;
        const autoFill = inputField[i].autoFill;
        // Text field
        // Tells the form to expose the animal Id input with name "Id" to a global state
        if(fieldType === "text"){
            inputs.push(
                <div key={id} className={"panel-input-row"}>
                    <InputLabel
                        labelFor={id}
                        label={label}
                        className = {'panel-label'}
                    />
                    <TextInput
                        name={`${compName}.${name}`}
                        id={id}
                        className={"form-control"}
                        value={prevForm?.[name] ?? ""}
                        required={isRequired}
                        validation={validation}
                        autoFill={autoFill}
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
                    <TextAreaInput
                        name={`${compName}.${name}`}
                        id={id}
                        className={"form-control"}
                        value={prevForm?.[name] ?? ""}
                        required={isRequired}
                        validation={validation}
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
                        name={`${compName}.${name}`}
                        id={id}
                        validation={validation}
                        className={"form-control"}
                        value={prevForm?.[name] ?? ""}
                        required={isRequired}
                    />
            </div>
            );
        }
        else if(fieldType === "dropdown"){ // Dropdown field
            const watchState = watch(watchVar as FieldPathValue<FieldValues, any>);
            const optConf = typeof inputField[i].options === 'function' ? inputField[i].options(watchState) : inputField[i].options;
            //const optDep = watch(options[name].dependency as FieldPathValue<FieldValues, any>);
            inputs.push(
                <div key={id} className={"panel-input-row"}>
                    <InputLabel
                        labelFor={id}
                        label={label}
                        className = {'panel-label'}
                    />
                    <DropdownSearch
                        optConf={optConf}
                        optDep={watchState}
                        initialValue={prevForm?.[name] ?? null}
                        name={`${compName}.${name}`}
                        id={id}
                        classname={"navbar__search-form"}
                        required={isRequired}
                        isClearable={true}
                        validation={validation}
                    />
                </div>
            );
        }
        else if(fieldType === "date"){
            inputs.push(
                <div key={id} className="panel-input-row">
                    <InputLabel
                        labelFor={id}
                        label={label}
                        className={'panel-label'}
                    />
                    <ControlledDateInput
                        name={`${compName}.${name}`}
                        id={id}
                        date={prevForm?.[name]?.value ? new Date(prevForm[name]?.value) : new Date()}
                        required={isRequired}
                        validation={validation}
                    />
                </div>
            );
        }
    }
    return (<>{inputs}</>);
}
export default BulkFormInput;

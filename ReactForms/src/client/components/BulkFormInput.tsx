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
import { findDropdownOptions } from '../query/helpers';

interface BulkFormProps {
    inputField: any[];
    compName: string;
    wnprcMetaData?: any;
}
/*
Form creation helper
@props inputField array of fields that describe themselves
@props prevForm object describing the previous form data if needed
@props dropdownOptions function for obtaining the options needed for dropdown menus
@props compName string for the name of the component that the fields belong to

 */
const BulkFormInput: FC<BulkFormProps> = (props) => {
    const {inputField, compName, wnprcMetaData} = props;
    const {watch} = useFormContext();

    const inputs = [];

    // Go through fields assigning divs depending on types
    // Date, Text, TextArea, Checkbox, Dropdown,
    for (let i = 0; i < inputField.length; i++) {
        const id = `${compName}_${i}`;
        const name = inputField[i].name;
        const label = inputField[i].caption;
        const isRequired = inputField[i].required;
        const fieldType = wnprcMetaData?.hasOwnProperty(name) ? wnprcMetaData[name].type
            : inputField[i].type.includes("Date") ? "date"
            : inputField[i].lookup ? "dropdown"
            : inputField[i].inputType;
        //const validation = inputField[i].validation;
        const watchVar = wnprcMetaData?.[name]?.watchVar;
        const autoFill = wnprcMetaData?.[name]?.autoFill;
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
                        autoFill={autoFill}
                        className={"form-control"}
                        required={isRequired}
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
                        required={isRequired}
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
                        className={"form-control"}
                        required={isRequired}
                    />
            </div>
            );
        }
        else if(fieldType === "dropdown"){ // Dropdown field

            const watchState = watchVar && {
                name: watchVar.substring(watchVar.lastIndexOf('.') + 1),
                field: watch(watchVar as FieldPathValue<FieldValues, any>)
            };

            const optConf = wnprcMetaData?.[name]?.lookup ? findDropdownOptions(wnprcMetaData[name].lookup,watchState)
                : inputField[i].lookup ? findDropdownOptions(inputField[i].lookup,watchState)
                : wnprcMetaData[name].options;
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
                        name={`${compName}.${name}`}
                        defaultOpts={wnprcMetaData?.[name]?.defaultOpts}
                        id={id}
                        classname={"navbar__search-form"}
                        required={isRequired}
                        isClearable={true}
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
                        required={isRequired}
                    />
                </div>
            );
        }
    }
    return (<>{inputs}</>);
}
export default BulkFormInput;

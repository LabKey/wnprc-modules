import * as React from 'react';
import {FC} from 'react';
import TextInput from './TextInput';
import TextAreaInput from './TextAreaInput';
import Checkbox from './Checkbox';
import ControlledDateInput from './ControlledDateInput';
import DropdownSearch from './DropdownSearch';

interface EditableGridCellProps {
    value: any;
    className: string;
    inputField: any;
    prevForm: any;
    name: string;
    id: string;
}
/*
<input
    type="text"
    value={value}
    onChange={onChange}
    className={"grid-cell " + className}
/>*/

export const EditableGridCell: FC<EditableGridCellProps> = (props) => {
    const {value, className, inputField, prevForm, name, id} = props;

    if(inputField.type === "date"){
        return(<ControlledDateInput
            name={name}
            className={className}
            id={id}
            date={prevForm?.[name]?.value ? new Date(prevForm[name]?.value) : new Date()}
            required={inputField.required}
            validation={inputField.validation}
        />);
    }else if(inputField.type === "textarea"){
        return(<TextAreaInput
            name={name}
            id={id}
            className={"form-control " + className}
            value={prevForm?.[name] ?? ""}
            required={inputField.required}
            validation={inputField.validation}
        />);
    }else if(inputField.type === "checkbox"){
        return(<Checkbox
            name={name}
            id={id}
            validation={inputField.validation}
            className={"form-control " + className}
            value={prevForm?.[name] ?? ""}
            required={inputField.required}
        />);
    }else if(inputField.type === "dropdown"){
        return(<DropdownSearch
            optConf={inputField.optConf}
            defaultOpts={inputField.defaultOpts}
            optDep={inputField.watchState}
            initialValue={prevForm?.[name] ?? null}
            name={name}
            id={id}
            classname={"navbar__search-form " + className}
            required={inputField.required}
            isClearable={true}
            validation={inputField.validation}
        />);
    }
    else{
        return(
            <TextInput
                name={name}
                id={id}
                className={"form-control " + className}
                value={prevForm?.[name] ?? ""}
                required={inputField.required}
                validation={inputField.validation}
                autoFill={inputField.autoFill}
            />
        );
    }
    return(<div>ugh</div>);
};
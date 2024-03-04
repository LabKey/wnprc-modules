import * as React from 'react';
import {FC} from 'react';
import TextInput from './TextInput';
import TextAreaInput from './TextAreaInput';
import Checkbox from './Checkbox';
import ControlledDateInput from './ControlledDateInput';
import DropdownSearch from './DropdownSearch';

interface EditableGridCellProps {
    value?: any;
    className: string;
    prevForm: any;
    type: any;
    name: string;
    id?: string;
    required: boolean;
    validation?: any;
    dropdownConfig?: any;
    autoFill?: any;
}
/*
<input
    type="text"
    value={value}
    onChange={onChange}
    className={"grid-cell " + className}
/>*/

export const EditableGridCell: FC<EditableGridCellProps> = (props) => {
    const {
        value,
        className,
        type,
        prevForm,
        name,
        id,
        required,
        validation,
        dropdownConfig,
        autoFill
    } = props;

    if(!type) return;
    //console.log(type);
    if(type === "Date and Time"){
        return(<ControlledDateInput
            name={name}
            className={className}
            id={id}
            date={prevForm?.[name]?.value}
            required={required}
            validation={validation}
        />);
    }else if(type === "textarea"){
        return(<TextAreaInput
            name={name}
            id={id}
            className={"form-control " + className}
            value={prevForm?.[name] ?? ""}
            required={required}
            validation={validation}
        />);
    }else if(type === "checkbox"){
        return(<Checkbox
            name={name}
            id={id}
            validation={validation}
            className={"form-control " + className}
            value={prevForm?.[name] ?? ""}
            required={required}
        />);
    }else if(type === "dropdown"){
        return(<DropdownSearch
            optConf={dropdownConfig.optConf}
            defaultOpts={dropdownConfig.defaultOpts}
            optDep={dropdownConfig.watchState}
            initialValue={prevForm?.[name] ?? null}
            name={name}
            id={id}
            classname={"navbar__search-form " + className}
            required={required}
            isClearable={true}
            validation={validation}
        />);
    }
    else{
        return(
            <TextInput
                name={name}
                id={id}
                className={"form-control " + className}
                value={prevForm?.[name] ?? ""}
                required={required}
                validation={validation}
                autoFill={autoFill}
                type={type.includes("Integer") || type.includes("Number") ? "number" : "text"}
            />
        );
    }
};
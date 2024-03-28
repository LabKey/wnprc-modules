import * as React from "react";
import "../theme/css/index.css";
import {useFormContext} from 'react-hook-form';
import { useEffect } from 'react';

interface TextAreaInputProps {
    name: string;
    id: string;
    className: string;
    value?: any;
    onChange?: any; //function
    onBlur?: any;
    onFocus?: any;
    required: boolean;
    validation?: any;
    rows?: number;
}

const TextAreaInput: React.FunctionComponent<TextAreaInputProps> = (props) => {
    const {
        name,
        id,
        className,
        value,
        onChange,
        onBlur,
        onFocus,
        required,
        validation,
        rows
    } = props;
    const {register, trigger, formState: {errors}} = useFormContext();
    const nameParsed = name.split(".");
    let stateName;
    let fieldName;
    let rowNum;
    if(nameParsed.length === 2) {
        [stateName,fieldName] = nameParsed;
    }else{ // it is 3
        [stateName,rowNum,fieldName] = nameParsed;
    }
    const borderColor = rowNum ? (errors?.[stateName]?.[rowNum]?.[fieldName] ? 'red' : null) : (errors?.[stateName]?.[fieldName] ? 'red' : null);

    // Trigger validation on load-in once to show required inputs
    useEffect(() => {
        trigger(name);
    }, []);

    return (
        <div className={"text-input"}>
            <textarea {...register(name, {
                required: required ? "This field is required" : false,
                onBlur: onBlur,
                onChange: onChange,
                value: value,
                validate: validation,
                })}
                name={name}
                id={id}
                className={className}
                rows={rows || 3}
                onChange={onChange}
                onFocus={onFocus}
                style={{borderColor: borderColor}}
             />
            <div className={"react-error-text"}>
                {rowNum ? (errors?.[stateName]?.[rowNum]?.[fieldName]?.message) : (errors?.[stateName]?.[fieldName]?.message)}
            </div>
        </div>
    );
};

export default TextAreaInput;

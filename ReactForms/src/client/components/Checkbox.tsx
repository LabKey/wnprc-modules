import React, { FC, useEffect } from 'react';
import {useFormContext} from 'react-hook-form';
import "../theme/css/index.css";

interface CheckboxProps {
    name: string;
    id: string;
    value?: boolean;
    onChange?: any;
    required?: boolean;
    className?: string;
    validation?: any;
}


export const Checkbox: FC<CheckboxProps> = (props): JSX.Element => {
    const {register, trigger, formState: {errors}} = useFormContext();
    const { name, id, className, value, required, onChange, validation} = props
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
        <>
            <label className={`checkbox-container ${errors?.[stateName]?.[fieldName] ? 'required' : ''}`}>
                <input {...register(name, {
                    required: required ? "This field is required" : false,
                    onChange: onChange,
                    value: value,
                    validate: validation,
                })}
                       type={"checkbox"}
                       id={id}
                       className={className}
                       style={{borderColor: borderColor}}
                />
                <span className={`checkbox-custom ${errors?.[stateName]?.[fieldName] ? 'required' : ''}`}></span>
            </label>
            <div className={"react-error-text"}>
                {rowNum ? (errors?.[stateName]?.[rowNum]?.[fieldName]?.message) : (errors?.[stateName]?.[fieldName]?.message)}
            </div>
        </>
    );
}

export default Checkbox;

import * as React from 'react';
import {FC} from 'react';
import TextInput from './TextInput';
import TextAreaInput from './TextAreaInput';
import Checkbox from './Checkbox';
import ControlledDateInput from './ControlledDateInput';
import DropdownSearch from './DropdownSearch';
import { getConfig, parseGridName } from '../query/helpers';
import { FieldPathValue, FieldValues, useFormContext, useWatch } from 'react-hook-form';

interface EditableGridCellProps {
    className: string;
    type: any;
    name: string;
    id?: string;
    required: boolean;
    validation?: any;
    dropdownConfig?: any;
    autoFill?: any;
    metaData: any;
    value?: any;
    apiData?: any;
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
        className,
        type,
        name,
        id,
        required,
        validation,
        dropdownConfig,
        autoFill,
        metaData,
        value,
        apiData
    } = props;
    if(!type) return;

    const useFormValues = () => {
        const { getValues } = useFormContext()

        return {
            ...useWatch(), // subscribe to form value updates

            ...getValues(), // always merge with latest form values
        }
    }
    console.log("API 2: ", apiData);

    if(type === "date"){
        return(<ControlledDateInput
            name={name}
            className={className}
            id={id}
            required={required}
            validation={validation}
            value={value}
        />);
    }else if(type === "textarea"){
        return(<TextAreaInput
            name={name}
            id={id}
            className={"form-control " + className}
            required={required}
            validation={validation}
            value={value}
        />);
    }else if(type === "checkbox"){
        return(<Checkbox
            name={name}
            id={id}
            validation={validation}
            className={"form-control " + className}
            required={required}
            value={value}
        />);
    }else if(type === "dropdown"){
        const [fieldName, rowNum,colName] = name.split(".");
        const watchVar = metaData.wnprcMetaData?.[colName]?.watchVar;
        const watchName = watchVar?.split?.(".")?.[1];
        const watchState = metaData.wnprcMetaData?.[colName]?.watchVar && {
            name: watchName,
            field: useFormValues()?.[fieldName]?.[rowNum]?.[watchName]
        };
        const optConf = metaData.wnprcMetaData?.[colName]?.lookup ? getConfig(metaData.wnprcMetaData?.[colName]?.lookup,watchState)
            : metaData.lookup ? getConfig(metaData.lookup,watchState)
                : metaData.options;

        return(<DropdownSearch
            optConf={optConf}
            initialValue={value}
            defaultOpts={metaData.wnprcMetaData?.[colName]?.defaultOpts}
            optDep={watchState}
            controlled={true}
            name={name}
            id={id}
            classname={"navbar__search-form " + className}
            required={required}
            isClearable={true}
            validation={validation}
            newDefaults={apiData}
        />);
    }
    else{
        return(
            <div className={"standard-input"}>
                <TextInput
                    name={name}
                    value={value}
                    id={id}
                    className={"" + className}
                    required={required}
                    validation={validation}
                    autoFill={autoFill}
                    type={type.includes("Integer") || type.includes("Number") ? "number" : "text"}
                />
                <span className={"underline"}></span>
            </div>
        );
    }
};
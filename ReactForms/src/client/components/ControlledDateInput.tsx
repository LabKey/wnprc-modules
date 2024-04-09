import * as React from 'react';
import { FC, useEffect } from 'react';
import { openDatepicker } from '../query/helpers';
import { ActionURL } from '@labkey/api';
import DatePicker from 'react-datepicker';
import "../theme/css/index.css";
import {
    useFormContext,
    Controller,
    FieldValues,
    FieldPathValue, Control, FormState,
} from 'react-hook-form';
import { UseFormTrigger } from 'react-hook-form/dist/types/form';


interface dateProps {
    name: string;
    value?: Date;
    id: string;
    validation?: any;
    required?: any;
    className?: string;
}

/*
customInput={
    <DateInput
        opendate={() => openDatepicker(ref)}
        iconpath={`${ActionURL.getContextPath()}/wnprc_ehr/static/images/icons8-calendar-24.png`}/>
}
 */


const ControlledDateInput: FC<dateProps> = (props) => {
    const {
        name,
        value,
        id,
        required,
        validation,
        className,
    } = props;

    const {control, formState: {errors}, trigger} = useFormContext();
    const nameParsed = name.split(".");
    let stateName;
    let fieldName;
    let rowNum;
    if(nameParsed.length === 2) {
        [stateName,fieldName] = nameParsed;
    }else{ // it is 3
        [stateName,rowNum,fieldName] = nameParsed;
    }

    // Trigger validation on load-in once to show required inputs
    useEffect(() => {
        trigger(name);
    }, []);

    return(
        <div className={errors?.[stateName]?.[fieldName] ? "date-controller date-controller-error" : "date-controller"}>
            <Controller
                control={control}
                defaultValue={(value || new Date()) as FieldPathValue<FieldValues, any>}
                name={name as FieldPathValue<FieldValues, any>}
                rules={{validate: validation, required: required ? "This field is required" : false} as FieldPathValue<FieldValues, any>}
                render={({field: {onChange, onBlur,value,ref}}) => (
                    <DatePicker
                        portalId={"ReactDatePicker"}
                        ref={ref}
                        id={id}
                        showTimeSelect
                        dateFormat="yyyy-MM-dd HH:mm"
                        todayButton="Today"
                        selected={value}
                        className={"form-control " + className}
                        name={name}
                        onChange={onChange}
                        onBlur={onBlur}
                        popperPlacement={"bottom"}
                        popperClassName={"my-datepicker-popper"}
                    />
                )}
            />
            <div className={"react-error-text"}>
                {rowNum ? (errors?.[stateName]?.[rowNum]?.[fieldName]?.message) : (errors?.[stateName]?.[fieldName]?.message)}
            </div>
        </div>
    );
}

export default ControlledDateInput;
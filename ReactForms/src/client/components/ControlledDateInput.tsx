import * as React from 'react';
import { FC, useEffect } from 'react';
import { openDatepicker } from '../query/helpers';
import DateInput from './DateInput';
import { ActionURL } from '@labkey/api';
import DatePicker from 'react-datepicker';
import "../theme/css/index.css";
import {
    useFormContext,
    Controller,
    FieldValues,
    FieldPathValue,
} from 'react-hook-form';


interface dateProps {
    name: string;
    date?: Date;
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
    const {name, date, id, required, validation, className} = props;
    const {control, formState: {errors}, trigger} = useFormContext();

    const [stateName, fieldName] = name.split('.');

    // Trigger validation on load-in once to show required inputs
    useEffect(() => {
        trigger(name);
    }, []);

    return(
        <div className={errors?.[stateName]?.[fieldName] ? "date-controller date-controller-error" : "date-controller"}>
            <Controller
                control={control}
                defaultValue={date as FieldPathValue<FieldValues, any> || new Date() as FieldPathValue<FieldValues, any>}
                name={name as FieldPathValue<FieldValues, any>}
                rules={{validate: validation, required: required ? "This field is required" : false} as FieldPathValue<FieldValues, any>}
                render={({field: {onChange, onBlur,value,ref}}) => (
                    <DatePicker
                        ref={ref}
                        id={id}
                        showTimeSelect
                        dateFormat="yyyy-MM-dd HH:mm"
                        todayButton="Today"
                        selected={value}
                        className={"form-control " + className}
                        name={name}
                        customInput={
                            <DateInput />
                        }
                        onChange={onChange}
                        onBlur={onBlur}
                        popperClassName={"my-datepicker-popper"}
                    />
                )}
            />
            <div className={"react-error-text"}>
                {errors?.[stateName]?.[fieldName]?.message}
            </div>
        </div>
    );
}

export default ControlledDateInput;
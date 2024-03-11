import * as React from "react";
//import { openDatepicker } from '../query/helpers';
import { FC, useRef, useState } from 'react';
import { ActionURL } from '@labkey/api';
import DatePicker from 'react-datepicker';

interface DateInputProps {
    opendate?: () => void;
    iconpath?: string;
    inputprops?: any;
    id: string;
    name: string
    className?: string;
    onBlur?: () => void;
    defaultValue: Date;
}

export const DateInput: FC<DateInputProps> = (props) => {
    const {
        inputprops,
        id,
        name,
        className,
        onBlur,
        defaultValue
    } = props;
    const iconpath= `${ActionURL.getContextPath()}/wnprc_ehr/static/images/icons8-calendar-24.png`;
    const calanderEl = useRef(false);
    const [dateState, setDateState] = useState<Date>(defaultValue ?? new Date());
    const openDatepicker = (calendarEl) => {
        console.log("calEL:", calendarEl);
        calendarEl.setOpen(true);
    };

    return (
      <>
          <DatePicker
          portalId={"ReactDatePicker"}
          id={id}
          showTimeSelect
          dateFormat="yyyy-MM-dd HH:mm"
          todayButton="Today"
          selected={dateState}
          className={"form-control " + className}
          name={name}
          onChange={() => setDateState(dateState)}
          onBlur={onBlur}
          popperPlacement={"bottom"}
          popperClassName={"my-datepicker-popper"}
        />
        <img id="date-calendar-img" onClick={() => openDatepicker(calanderEl)} src={iconpath}/>
      </>
    );
};

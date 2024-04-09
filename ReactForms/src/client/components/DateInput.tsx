import * as React from "react";
//import { openDatepicker } from '../query/helpers';
import { FC, useEffect, useRef, useState } from 'react';
import { ActionURL } from '@labkey/api';
import DatePicker from 'react-datepicker';

interface DateInputProps {
    opendate?: () => void;
    iconpath?: string;
    id: string;
    name: string
    className?: string;
    onBlur?: () => void;
    defaultValue: Date;
}

export const DateInput: FC<DateInputProps> = (props) => {
    const {
        id,
        name,
        className,
        onBlur,
        defaultValue
    } = props;
    const [dateState, setDateState] = useState<Date>(defaultValue ?? new Date());

    return (
      <>
          <DatePicker
          portalId={"ReactDatePicker"}
          id={id}
          showTimeSelect
          dateFormat="yyyy-MM-dd HH:mm"
          todayButton="Today"
          selected={dateState}
          className={className}
          name={name}
          onChange={(date) => setDateState(date)}
          onBlur={onBlur}
          popperPlacement={"bottom"}
          popperClassName={"my-datepicker-popper"}
        />
      </>
    );
};

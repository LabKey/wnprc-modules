import * as React from "react";
import { openDatepicker } from '../query/helpers';
import { forwardRef } from 'react';
import { ActionURL } from '@labkey/api';

interface DateInputProps {
  opendate: () => void;
  iconpath?: string;
  inputprops?: any;
  ref: any;
}

/**
 * Meant to use as a custom date input for react-datepicker
 */
export const DateInput = forwardRef(function DateInput(props, ref) {
    const { ...inputprops} = props;
    const iconpath= `${ActionURL.getContextPath()}/wnprc_ehr/static/images/icons8-calendar-24.png`
    return (
      <>
        <input className="custom-date-input" {...inputprops} />
        <img id="date-calendar-img" onClick={() => openDatepicker(ref)} src={iconpath}/>
      </>
    );
});

export default DateInput;

import * as React from 'react';
import  DateInput from '../components/DateInput';
import {useRef, useState} from 'react';
import DatePicker from 'react-datepicker';
import "../theme/css/react-datepicker.css";
import "../theme/css/index.css";
import "../theme/css/tooltip.css";

export default {
    title: 'DatePicker',
    component: DatePicker,
};

export const ToStorybook = () => {
    const [date, setDate] = useState(new Date());

    let calendarEl = useRef(null);

    const handleRawDateChange = e => {
        if (e.currentTarget.value instanceof Date && !isNaN(e.currentTarget.value)){
            setDate(e.currentTarget.value);
        }
    };

    const handleDateChange = date => {
        setDate(date);
    };

    const openDatepicker = () => {
        //@ts-ignore
        calendarEl.setOpen(true);
    };
    return (
        <DatePicker
            ref={r => (calendarEl = r)}
            showTimeSelect
            onChangeRaw={handleRawDateChange}
            dateFormat="yyyy-MM-dd HH:mm"
            todayButton="Today"
            selected={date}
            className="form-control"
            name="date"
            id="date-id"
            onFocus={()=> {console.log("Focused!")}}
            onChange={handleDateChange}
            customInput={<DateInput opendate={openDatepicker} />}
        />
    )
};


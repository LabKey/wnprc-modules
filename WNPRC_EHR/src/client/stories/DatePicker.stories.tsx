/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
            ref={r => (calendarEl.current = r)}
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


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
import * as React from "react";

interface DateInputProps {
  opendate: () => void;
  iconpath?: string;
  inputprops?: any;
}

/**
 * Meant to use as a custom date input for react-datepicker
 */
class DateInput extends React.Component<DateInputProps>
{
  render()
  {
    const {opendate, iconpath, ...inputprops} = this.props;

    const openDatepicker = () => {
      this.props.opendate();
    };

    return (
      <>
        <input className="custom-date-input" {...inputprops} />
        <img id="date-calendar-img" onClick={openDatepicker} src={iconpath}/>
      </>
    );
  }
}

export default DateInput;

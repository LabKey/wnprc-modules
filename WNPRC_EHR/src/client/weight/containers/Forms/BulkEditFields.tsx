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
import DatePicker from "react-datepicker";
import { useEffect, useState } from "react";
import "../../../theme/css/react-datepicker.css";
import "../../../theme/css/index.css";
import "../../../theme/css/tooltip.css";
import DateInput from "../../../components/DateInput";
import { useRef } from "react";
import DropdownOptions from "../../components/DropdownOptions";
import {BulkEditFieldProps} from "../../typings/main"
import "../../../theme/css/index.css";
/**
 * A set of fields whose values are meant to be passed up to a parent modal.
 */
const BulkEditFields: React.FunctionComponent<BulkEditFieldProps> = (props) => {
  const { fieldValues, restraints } = props;
  const [date, setDate] = useState<object>(new Date());
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [remark, setRemark] = useState<string>("");
  const [restraint, setRestraint] = useState<string>("");

  //lift state up to parent
  //can either use full objects or objects w errors
  useEffect(() => {
    fieldValues({
      weight: { value: weight, error: "" },
      date: { value: date, error: "" },
      remark: { value: remark, error: "" },
      restraint: {value: restraint, error: ""}
    });
  }, [weight, date, remark, restraint]);

  const openDatepicker = (): void => {
    //@ts-ignore
    calendarEl.setOpen(true);
  };

  const handleDateChange = (date: object): void => {
    setDate(date);
  };

  const handleRestraintChange = (restraint: string): void => {
    setRestraint(restraint);
  };

  const handleWeightChange = (e: any): void => {
    const inputValue = e.target.value;
    const parsedValue = parseFloat(inputValue);

    if (!Number.isNaN(parsedValue)) {
      setWeight(parsedValue);
    } else {
      setWeight(undefined);
    }
  }

  let calendarEl = useRef(null);

  return (
    <div>
      <div className="card-body">
        <div className="row">
          <div className="col-xs-3">Date:</div>
          <div className="col-xs-9">
            <DatePicker
              ref={r => (calendarEl = r)}
              wrapperClassName={"react-datepicker"}
              showTimeSelect
              dateFormat="yyyy-MM-dd HH:mm"
              todayButton="Today"
              selected={date}
              className="form-control"
              onChange={handleDateChange}
              name="date"
              customInput={<DateInput opendate={openDatepicker} />}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-3">Weight:</div>
          <div className="col-xs-9">
            <input
              className="form-control"
              id="weight-bulk"
              type="number"
              value={weight !== undefined ? weight : ""}
              min={0}
              onChange={e => handleWeightChange(e)}
              required
            />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-3">
            <label htmlFor="restraints">Restraint: </label>
          </div>
          <div className="col-xs-9">
            <DropdownOptions
              options={restraints}
              initialvalue={restraint}
              value={handleRestraintChange}
              name="restraints"
              id="restraint-bulk"
              classname="form-control"
              valuekey="type"
              displaykey="type"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-3">Remark:</div>
          <div className="col-xs-9">
            <textarea
              className="form-control"
              rows={3}
              id="remark-bulk"
              value={remark}
              onChange={e => {
                setRemark(e.target.value);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEditFields;

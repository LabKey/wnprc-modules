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

/**
 * A set of fields whose values are meant to be passed up to a parent modal.
 */
const BulkEditFields: React.FunctionComponent<BulkEditFieldProps> = props => {
  const { fieldValues, restraints } = props;
  const [date, setDate] = useState<object>(new Date());
  const [weight, setWeight] = useState<number>(null);
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

  let calendarEl = useRef(null);

  return (
    <div>
      <div className="card-body">
        <div className="row">
          <div className="col-xs-3">Date:</div>
          <div className="col-xs-9">
            <DatePicker
              ref={r => (calendarEl = r)}
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
              value={weight}
              min={0}
              onChange={e => {
                setWeight(parseFloat(e.target.value));
              }}
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

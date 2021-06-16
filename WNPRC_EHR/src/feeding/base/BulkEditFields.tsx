import * as React from "react";
import DatePicker from "react-datepicker";
import { useEffect, useState, useContext } from "react";
import "../../theme/css/react-datepicker.css";
import "../../theme/css/index.css";
import "../../theme/css/tooltip.css";
import DateInput from "../../components/DateInput";
import { useRef } from "react";
import DropdownOptions from "../../components/DropdownOptions";
import { AppContext } from "./ContextProvider";

/**
 * A set of fields whose values are meant to be passed up to a parent modal.
 */
const BulkEditFields: React.FunctionComponent<any> = (props) => {
  const [type, setType] = useState<any>("");
  const [amount, setAmount] = useState<any>("");
  const [date, setDate] = useState<any>(new Date());
  const { feedingTypes, setBulkEditValuesExternal } = useContext(AppContext);

  // Set bulk edit values in the context provider
  useEffect(() => {
    setBulkEditValuesExternal({
      amount: { value: amount, error: "" },
      type: { value: type, error: "" },
      date: { value: date, error: "" },
    });
  }, [type, amount, date]);

  const openDatepicker = () => {
    //@ts-ignore
    calendarEl.setOpen(true);
  };

  const handleDateChange = (date) => {
    setDate(date);
  };

  let calendarEl = useRef(null);

  return (
    <div>
      <div className="card-body">
        <div className="row">
          <div className="col-xs-3">Date:</div>
          <div className="col-xs-9">
            <DatePicker
              ref={(r) => (calendarEl = r)}
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
          <div className="col-xs-3">
            <label htmlFor="restraints">Chow: </label>
          </div>
          <div className="col-xs-9">
            <DropdownOptions
              options={feedingTypes}
              initialvalue={type}
              value={(e) => {
                setType(e);
              }}
              name="type"
              id="type-bulk"
              classname="form-control"
              valuekey="rowid"
              displaykey="value"
              required={false}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-3">Amount:</div>
          <div className="col-xs-9">
            <input
              className="form-control"
              id="amount-bulk"
              type="number"
              value={amount}
              min="0"
              onChange={(e) => {
                setAmount(e.target.value);
              }}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEditFields;

import * as React from "react";
import DatePicker from "react-datepicker";
import "../../theme/css/react-datepicker.css";
import "../../theme/css/index.css";
import "../../theme/css/tooltip.css";
import {
  enteredWeightIsGreaterThanPrevWeight,
  enteredWeightIsLessThanPrevWeight
} from "../../query/helpers";
import { useEffect, useState } from "react";
import { labkeyActionSelectWithPromise } from "../../query/actions";
import { InfoProps, ConfigProps } from "../../typings/main";
import { infoStates } from "./EnterWeightFormContainer";
import { useRef } from "react";
import DateInput from "../../components/DateInput";
import { useContext } from "react";
import { AppContext } from "../App/ContextProvider";
import DropdownOptions from "../../components/DropdownOptions";

interface WeightFormProps {
  animalid?: string;
  weight?: number;
  date?: any;
  restraint?: string;
  remark?: string;
  index?: any;
  infoState?: any;
  liftUpVal?: (name: string, value: any, index: number) => void;
  liftUpAnimalInfo: (animalInfo: any) => void;
  liftUpErrorLevel: (errorLevel: string) => void;
}

/**
 * Main modal which holds the values for the fields in the weight dataset,
 * and the restraints  dataset.
 */

const EnterWeightForm: React.FunctionComponent<WeightFormProps> = props => {
  const {
    animalid,
    weight,
    date,
    remark,
    restraint,
    index,
    infoState,
    liftUpAnimalInfo,
    liftUpVal,
    liftUpErrorLevel
  } = props;
  const [prevweight, setPrevWeight] = useState<any>("");
  const [animalInfo, setAnimalInfo] = useState<InfoProps>(null);
  const [weightWarning, setWeightWarning] = useState("");
  const [animalError, setAnimalError] = useState("");
  const [weightError, setWeightError] = useState("");
  const [anyErrors, setAnyErrors] = useState(true);
  const [errorLevel, setErrorLevel] = useState("no-action");
  const [animalInfoState, setAnimalInfoState] = useState<infoStates>("waiting");

  const { submit, submitted, setrestraints, restraints } = useContext(
    AppContext
  );

  useEffect(() => {
    liftUpErrorLevel(errorLevel);
  }, []);

  //always fire this once
  useEffect(() => {
    infoState(animalInfoState);
  }, []);

  useEffect(() => {
    //validateItems();
  },[]);

  useEffect(() => {
    infoState(animalInfoState);
  }, [animalInfoState]);

  useEffect(() => {
    liftUpAnimalInfo(animalInfo);
  }, [animalInfo]);

  useEffect(() => {
    liftUpErrorLevel(errorLevel);
  }, [errorLevel]);


  //validate items to set error levels which determine which buttons are disabled
  const validateItems = (name, value) => {
    if (value == "" && name == "animalid") {
      setAnyErrors(true);
      setErrorLevel("no-action");
      return;
    }
    if (value == "" && name == "weight" && animalError == "") {
      setAnyErrors(true);
      setErrorLevel("saveable");
      return;
    }
    if (value != "" && name == "weight" && animalError == "") {
      setAnyErrors(false);
      setErrorLevel("submittable");
      return;
    }
  };

  const handleChange = e => {
    liftUpVal(e.target.name, e.target.value, index);
    validateItems(e.target.name, e.target.value);

  };

  const handleRestraintChange = val => {
    liftUpVal("restraint", val, index);
  };

  const handleDateChange = date => {
    liftUpVal("date", date, index);
  };

  const handleRawDateChange = e => {
    if (e.currentTarget.value instanceof Date && !isNaN(e.currentTarget.value)){
      liftUpVal("date", new Date(e.currentTarget.value), index);
    }
  };

  const getAnimalInfo = e => {
    if (e.target.name == "animalid" && e.nativeEvent.type != "focus") {
      if (e.target.value == "") {
        setAnimalError("Required");
        setAnyErrors(true);
        return;
      } else {
        setAnimalError("");
        return;
      }
    }
    if (e.target.value == "" && e.nativeEvent.type == "blur" && e.target.name=="animalid") {
      setAnimalError("Required");
      return;
    }

    if (e.target.value == "" && e.target.name=="animalid") {
      return;
    }

    //issue when cacheing this... if animalId is diff than prev
    if (animalInfo != null && animalid === animalInfo.Id) {
      liftUpAnimalInfo(animalInfo);
      setAnimalInfoState("loading-success");
      return;
    }

    //need to show loading spinner
    setAnimalInfoState("loading");

    let config: ConfigProps = {
      schemaName: "study",
      queryName: "demographics",
      sort: "-date",
      filterArray: [
        LABKEY.Filter.create("Id", animalid, LABKEY.Filter.Types.EQUAL)
      ]
    };
    console.log(config);
    labkeyActionSelectWithPromise(config).then(data => {
      //cache animal info
      if (data["rows"][0]) {
        setAnimalInfo(data["rows"][0]);
        setPrevWeight(data["rows"][0]["Id/MostRecentWeight/MostRecentWeight"]);
        infoState("loading-success");
        validateItems("animalid", animalid);
        setAnimalError("");
      } else {
        //TODO propagate up animal not found issue?
        infoState("loading-unsuccess");
        setAnimalError("Animal Not Found");
        validateItems("animalid", animalid)
      }
    });
  };

  const checkWeights = e => {
    if (enteredWeightIsGreaterThanPrevWeight(weight, prevweight, 10)) {
      setWeightWarning("Weight is greater than 10% of previous weight.");
    } else if (enteredWeightIsLessThanPrevWeight(weight, prevweight, 10)) {
      setWeightWarning("Weight is less than 10% of previous weight.");
    } else {
      setWeightWarning("");
    }

    if (e.target.value.length == 0) {
      setWeightError("Required");
    } else {
      setWeightError("");
      setErrorLevel("submittable");
    }
  };

  let calendarEl = useRef(null);

  const openDatepicker = () => {
    //@ts-ignore
    calendarEl.setOpen(true);
  };

  return (
    <div>
      <div className="row">
        <div className="col-xs-2">
          <label htmlFor="animalid">Id:</label>
        </div>
        <div className="col-xs-9">
          <input
            type="text"
            name="animalid"
            id={`animalid_${index}`}
            className="form-control"
            value={animalid.toLowerCase()}
            onChange={handleChange}
            onBlur={getAnimalInfo}
            onFocus={getAnimalInfo}
            required
            autoFocus
          />
          {animalError && <span data-tooltip={animalError}>❗</span>}
        </div>
      </div>
      <div className="row">
        <div className="col-xs-2">
          <label htmlFor="weight">Weight: </label>
        </div>
        <div className="col-xs-9">
          <input
            type="number"
            step="any"
            name="weight"
            id={`weight_${index}`}
            className="form-control"
            value={weight || ""}
            onChange={handleChange}
            onFocus={getAnimalInfo}
            onBlur={e => {
              checkWeights(e);
            }}
            required
          />
          {weightWarning && (
            <span data-tooltip={weightWarning} id="weight-warning">
              ⚠️
            </span>
          )}
          {weightError && <span data-tooltip={weightError}>❗</span>}
        </div>
      </div>
      <div className="row">
        <div className="col-xs-2">
          <label htmlFor="date">Date: </label>
        </div>
        <div className="col-xs-9">
          <DatePicker
            ref={r => (calendarEl = r)}
            showTimeSelect
            onChangeRaw={handleRawDateChange}
            dateFormat="yyyy-MM-dd HH:mm"
            todayButton="Today"
            selected={date}
            className="form-control"
            name="date"
            id={`date_${index}`}
            onChange={handleDateChange}
            onFocus={getAnimalInfo}
            customInput={<DateInput value={date} opendate={openDatepicker} />}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-xs-2">
          <label htmlFor="restraints">Restraint: </label>
        </div>
        <div className="col-xs-9">
          <DropdownOptions
            options={restraints}
            initialvalue={restraint}
            value={handleRestraintChange}
            name="restraints"
            id={`restraint_${index}`}
            classname="form-control"
            valuekey="type"
            displaykey="type"
          />
        </div>
      </div>
      <div className="row">
        <div className="col-xs-2">
          <label htmlFor="remark">Remark: </label>
        </div>
        <div className="col-xs-9">
          <textarea
            name="remark"
            id={`remark_${index}`}
            className="form-control"
            rows={3}
            value={remark}
            onChange={handleChange}
            onFocus={getAnimalInfo}
          />
        </div>
      </div>
    </div>
  );
};

export default EnterWeightForm;

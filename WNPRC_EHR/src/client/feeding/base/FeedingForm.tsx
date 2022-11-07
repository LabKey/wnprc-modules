import * as React from "react";
import TextInput from "../../components/TextInput";
import InputLabel from "../../components/InputLabel";
import DateInput from "../../components/DateInput";
import { useContext, useRef } from "react";
import { AppContext } from "./ContextProvider";
import DatePicker from "react-datepicker";
import {labkeyActionSelectWithPromise, lookupAnimalInfo} from "../../query/helpers";
import { ActionURL } from "@labkey/api";
import DropdownOptions from "../../components/DropdownOptions";

const FeedingForm: React.FunctionComponent<any> = (props) => {
  const {
    setQueryDetailsExternal,
    queryDetails,
    setFormDataExternal,
    formData,
    setAnimalInfoExternal,
    animalInfo,
    setAnimalInfoStateExternal,
    animalInfoState,
    feedingTypes,
    animalInfoCache,
    updateAnimalInfoCacheExternal
  } = useContext(AppContext);
  const { values, index } = props;

  let calendarEl = useRef(null);

  const updateFormValues = (name: string, value: any, index: number) => {
    const newValues = [...formData];
    newValues[index][name]["value"] = value;
    setFormDataExternal(newValues);
  };

  const handleValueChange = (e) => {
    updateFormValues(e.currentTarget.name, e.currentTarget.value, props.index);
  };

  const handleTypeChange = (val) => {
    updateFormValues("type", val, props.index);
  };

  const handleRawDateChange = (e) => {
    if (
      e.currentTarget.value instanceof Date &&
      !isNaN(e.currentTarget.value)
    ) {
      updateFormValues("date", e.currentTarget.value, props.index);
    }
  };

  const handleDateChange = (date) => {
    updateFormValues("date", date, props.index);
  };

  const openDatepicker = () => {
    //@ts-ignore
    calendarEl.setOpen(true);
  };
  const getAnimalInfo = () => {
    if (values.Id.value == "") {
      setAnimalInfoStateExternal("waiting");
      return;
    }
    if (animalInfoCache && animalInfoCache[values.Id.value]){
      setAnimalInfoExternal(animalInfoCache[values.Id.value]);
      return;
    }
    lookupAnimalInfo(values.Id.value).then((d) => {
      setAnimalInfoExternal(d);
      setAnimalInfoStateExternal("loading-success");
      updateAnimalInfoCacheExternal(d)
    }).catch((d)=> {
      setAnimalInfoStateExternal("loading-unsuccess");
    });
  }

  return (
    <>
      <div className="row">
        <div className="col-xs-3">
          {/*queryDetails && <InputLabel labelFor="Id" label={queryDetails.Id.shortCaption}/>*/}
          <InputLabel labelFor="Id" label="Id" />
        </div>
        <div className="col-xs-9">
          <TextInput
            name="Id"
            id={`id_${index}`}
            className="form-control Id"
            value={values.Id.value}
            onChange={handleValueChange}
            onFocus={() => {
              getAnimalInfo();
            }}
            required={true}
            autoFocus={false}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-xs-3">
          <InputLabel labelFor="date" label="Date" />
        </div>
        <div className="col-xs-9">
          <DatePicker
            ref={(r) => (calendarEl = r)}
            showTimeSelect
            onChangeRaw={handleRawDateChange}
            dateFormat="yyyy-MM-dd HH:mm"
            todayButton="Today"
            selected={values.date.value}
            className="form-control"
            name="date"
            onFocus={() => {
              getAnimalInfo();
            }}
            onChange={handleDateChange}
            customInput={
              <DateInput
                opendate={openDatepicker}
                iconpath={`${ActionURL.getContextPath()}/wnprc_ehr/static/images/icons8-calendar-24.png`}/>
            }
          />
        </div>
      </div>
      <div className="row">
        <div className="col-xs-3">
          {/*queryDetails && <InputLabel labelFor="Id" label={queryDetails.Id.shortCaption}/>*/}
          <InputLabel labelFor="type" label="Chow" />
        </div>
        <div className="col-xs-9">
          <DropdownOptions
            options={feedingTypes}
            initialvalue={values.type.value}
            value={handleTypeChange}
            name="type"
            id={`type_${index}`}
            classname="form-control"
            valuekey="rowid"
            displaykey="value"
            required={true}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-xs-3">
          {/*queryDetails && <InputLabel labelFor="Id" label={queryDetails.Id.shortCaption}/>*/}
          <InputLabel labelFor="amount" label="Amount" />
        </div>
        <div className="col-xs-9">
          <TextInput
            name="amount"
            id={`amount_${index}`}
            className="form-control type"
            value={values.amount.value}
            onChange={handleValueChange}
            onFocus={() => {
              getAnimalInfo();
            }}
            required={true}
            autoFocus={false}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-xs-3">
          {/*queryDetails && <InputLabel labelFor="Id" label={queryDetails.Id.shortCaption}/>*/}
          <InputLabel labelFor="remark" label="Remark" />
        </div>
        <div className="col-xs-9">
          <textarea
            name="remark"
            id={`remark_${index}`}
            className="form-control remark"
            rows={3}
            value={values.remark.value}
            onChange={handleValueChange}
            onFocus={() => {
              getAnimalInfo();
            }}
            required={false}
            autoFocus={false}
          />
        </div>
      </div>
    </>
  );
};

export default FeedingForm;

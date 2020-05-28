import * as React from 'react';
import TextInput from '../../components/TextInput';
import InputLabel from '../../components/InputLabel';
import DateInput from '../../components/DateInput';
import {useContext, useEffect, useRef} from "react";
import {AppContext} from "./ContextProvider";
import DatePicker from 'react-datepicker';
import * as webpack from "webpack";
import {labkeyActionSelectWithPromise} from "../../query/helpers";
import {Filter} from "@labkey/api";

const FeedingForm: React.FunctionComponent<any> = props => {

    const {setQueryDetailsExternal, queryDetails, setFormDataExternal, formData,setAnimalInfoExternal,
        animalInfo,
        setAnimalInfoStateExternal,
        animalInfoState} = useContext(AppContext);
    const {values} = props;

    let calendarEl = useRef(null);

    const updateFormValues = (name: string, value: any, index: number) => {
        const newValues = [...formData];
        newValues[index][name]["value"] = value;
        setFormDataExternal(newValues);
    };

    const handleValueChange = (e) => {
        updateFormValues(e.currentTarget.name, e.currentTarget.value, props.index)
    };

    const handleRawDateChange = e => {
        if (e.currentTarget.value instanceof Date && !isNaN(e.currentTarget.value)){
            updateFormValues("date", e.currentTarget.value, props.index)
        }
    };

    const handleDateChange = date => {
        updateFormValues("date", date, props.index);
    };

    const openDatepicker = () => {
        //@ts-ignore
        calendarEl.setOpen(true);
    };
    const lookupAnimalInfo = () => {
        if (values.Id.value == ""){
            setAnimalInfoStateExternal("waiting");
            return;
        }
        console.log('setting Id');
        let config = {
            schemaName: "study",
            queryName: "demographics",
            sort: "-date",
            filterArray: [
                Filter.create("Id", values.Id.value, Filter.Types.EQUAL)
            ]
        };
        console.log(config);
        labkeyActionSelectWithPromise(config).then(data => {
            //cache animal info
            if (data["rows"][0]) {
                setAnimalInfoExternal(data["rows"][0]);
                setAnimalInfoStateExternal("loading-success");
                /*validateItems("Id", Id);
                setAnimalError("");*/
            } else {
                //TODO propagate up animal not found issue?
                setAnimalInfoStateExternal("loading-unsuccess");
                /*setAnimalError("Animal Not Found");
                validateItems("Id", Id)*/
            }
        }).catch(data => {
            console.log(values.Id.value);
            console.log(data);
        });

    };

    return (
        <>
            <div className="row">
                <div className="col-xs-3">
                    {queryDetails && <InputLabel labelFor="Id" label={queryDetails.Id.shortCaption}/>}
                </div>
                <div className="col-xs-9">
                    <TextInput
                        name="Id"
                        id="Id-id"
                        className="form-control Id"
                        value={values.Id.value}
                        onChange={handleValueChange}
                        onBlur={()=>{lookupAnimalInfo()}}
                        onFocus={()=>{console.log('focus')}}
                        required={true}
                        autoFocus={true}
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-xs-3">
                    <InputLabel labelFor="date" label="Date"/>
                </div>
                <div className="col-xs-9">
                    <DatePicker
                        ref={r => (calendarEl = r)}
                        showTimeSelect
                        onChangeRaw={handleRawDateChange}
                        dateFormat="yyyy-MM-dd HH:mm"
                        todayButton="Today"
                        selected={values.date.value}
                        className="form-control"
                        name="date"
                        onFocus={()=> {console.log("Focused!")}}
                        onChange={handleDateChange}
                        customInput={<DateInput value={values.date.value} opendate={openDatepicker} />}
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-xs-3">
                    {/*queryDetails && <InputLabel labelFor="Id" label={queryDetails.Id.shortCaption}/>*/}
                    <InputLabel labelFor="type" label="Chow"/>
                </div>
                <div className="col-xs-9">
                    <TextInput
                        name="type"
                        id="type-id"
                        className="form-control type"
                        value={values.type.value}
                        onChange={handleValueChange}
                        onBlur={()=>{console.log('blur')}}
                        onFocus={()=>{console.log('focus')}}
                        required={true}
                        autoFocus={false}
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-xs-3">
                    {/*queryDetails && <InputLabel labelFor="Id" label={queryDetails.Id.shortCaption}/>*/}
                    <InputLabel labelFor="amount" label="Amount"/>
                </div>
                <div className="col-xs-9">
                    <TextInput
                        name="amount"
                        id="amount-id"
                        className="form-control  amount"
                        value={values.amount.value}
                        onChange={handleValueChange}
                        onBlur={()=>{console.log('blur')}}
                        onFocus={()=>{console.log('focus')}}
                        required={true}
                        autoFocus={false}
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-xs-3">
                    {/*queryDetails && <InputLabel labelFor="Id" label={queryDetails.Id.shortCaption}/>*/}
                    <InputLabel labelFor="remark" label="Remark"/>
                </div>
                <div className="col-xs-9">
                    <textarea
                        name="remark"
                        id="remark-id"
                        className="form-control remark"
                        rows={3}
                        value={values.remark.value}
                        onChange={handleValueChange}
                        onBlur={()=>{console.log('blur')}}
                        onFocus={()=>{console.log('focus')}}
                        required={true}
                        autoFocus={false}
                    />
                </div>
            </div>
        </>
    )
    
};

export default FeedingForm;

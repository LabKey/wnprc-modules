import * as React from 'react';
import TextInput from '../../components/TextInput';
import InputLabel from '../../components/InputLabel';
import DateInput from '../../components/DateInput';
import {useContext, useRef} from "react";
import {AppContext} from "./ContextProvider";
import DatePicker from 'react-datepicker';

const FeedingForm: React.FunctionComponent<any> = props => {

    const {setQueryDetailsExternal, queryDetails, setFormDataExternal, formData} = useContext(AppContext);

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

    return (
        <>
            <div className="row">
                <div className="col-xs-3">
                    {/*queryDetails && <InputLabel labelFor="animalid" label={queryDetails.Id.shortCaption}/>*/}
                    <InputLabel labelFor="animalid" label="Id"/>
                </div>
                <div className="col-xs-9">
                    <TextInput
                        name="animalid"
                        id="animalid-id"
                        className="form-control animalid"
                        value={props.values.animalid.value}
                        onChange={handleValueChange}
                        onBlur={()=>{console.log('blur')}}
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
                        selected={props.values.date.value}
                        className="form-control"
                        name="date"
                        onFocus={()=> {console.log("Focused!")}}
                        onChange={handleDateChange}
                        customInput={<DateInput value={props.values.date.value} opendate={openDatepicker} />}
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-xs-3">
                    {/*queryDetails && <InputLabel labelFor="animalid" label={queryDetails.Id.shortCaption}/>*/}
                    <InputLabel labelFor="type" label="Chow"/>
                </div>
                <div className="col-xs-9">
                    <TextInput
                        name="type"
                        id="type-id"
                        className="form-control type"
                        value={props.values.type.value}
                        onChange={handleValueChange}
                        onBlur={()=>{console.log('blur')}}
                        onFocus={()=>{console.log('focus')}}
                        required={true}
                        autoFocus={true}
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-xs-3">
                    {/*queryDetails && <InputLabel labelFor="animalid" label={queryDetails.Id.shortCaption}/>*/}
                    <InputLabel labelFor="amount" label="Amount"/>
                </div>
                <div className="col-xs-9">
                    <TextInput
                        name="amount"
                        id="amount-id"
                        className="form-control  amount"
                        value={props.values.amount.value}
                        onChange={handleValueChange}
                        onBlur={()=>{console.log('blur')}}
                        onFocus={()=>{console.log('focus')}}
                        required={true}
                        autoFocus={true}
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-xs-3">
                    {/*queryDetails && <InputLabel labelFor="animalid" label={queryDetails.Id.shortCaption}/>*/}
                    <InputLabel labelFor="remark" label="Remark"/>
                </div>
                <div className="col-xs-9">
                    <textarea
                        name="remark"
                        id="remark-id"
                        className="form-control remark"
                        rows={3}
                        value={props.values.remark.value}
                        onChange={handleValueChange}
                        onBlur={()=>{console.log('blur')}}
                        onFocus={()=>{console.log('focus')}}
                        required={true}
                        autoFocus={true}
                    />
                </div>
            </div>
        </>
    )
    
};

export default FeedingForm;

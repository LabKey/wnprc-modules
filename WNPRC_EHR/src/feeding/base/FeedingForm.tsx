import * as React from 'react';
import TextInput from '../../components/TextInput';
import InputLabel from '../../components/InputLabel';
import DateInput from '../../components/DateInput';
import {useContext, useRef} from "react";
import {AppContext} from "./ContextProvider";
import DatePicker from 'react-datepicker';

const FeedingForm: React.FunctionComponent<any> = props => {

    const {setQueryDetailsExternal, queryDetails} = useContext(AppContext);

    let calendarEl = useRef(null);
    const liftUpValue = (e) => {
        props.liftUpValue(e.currentTarget.name, e.currentTarget.value);
    };

    const handleRawDateChange = e => {
        if (e.currentTarget.value instanceof Date && !isNaN(e.currentTarget.value)){
            props.liftUpValue("date", e.currentTarget.value);
        }
    };

    const handleDateChange = date => {
        props.liftUpValue("date", date)
    };

    const openDatepicker = () => {
        //@ts-ignore
        calendarEl.setOpen(true);
    };

    return (
        <>
            <div className="row">
                <div className="col-xs-2">
                    {/*queryDetails && <InputLabel labelFor="animalid" label={queryDetails.Id.shortCaption}/>*/}
                    <InputLabel labelFor="animalid" label="Id"/>
                </div>
                <div className="col-xs-8">
                    <TextInput
                        name="animalid"
                        id="animalid-id"
                        className="animalid"
                        value={props.values.animalid.value}
                        onChange={liftUpValue}
                        onBlur={()=>{console.log('blur')}}
                        onFocus={()=>{console.log('focus')}}
                        required={true}
                        autoFocus={true}
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-xs-2">
                    <InputLabel labelFor="date" label="Date"/>
                </div>
                <div className="col-xs-8">
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
        </>
    )
    
};

export default FeedingForm;

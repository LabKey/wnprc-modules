//bulk rows add to component will need onChange handler and state management. Pass in names count number for cnt
import * as React from 'react';
import { FC } from 'react';
import "../theme/css/index.css";
import InputLabel from './InputLabel';
import TextInput from './TextInput';
import Checkbox from './Checkbox';
import DropdownSearch from './DropdownSearch';
import { handleDateChange, handleInputChange, openDatepicker } from '../query/helpers';
import DatePicker from 'react-datepicker';
import DateInput from './DateInput';
import { ActionURL } from '@labkey/api';

interface BulkFormProps {
    inputField: any[];
    state: any;
    setState: any;
    required: string[];
}
/*
Creates forms
@props inputField array of fields that describe themselves
@props state State management for form/row
@props setState State setter for changing inputs
@props required determines if the field is required or not

 */
const BulkFormInput: FC<BulkFormProps> = (props) => {
    const {inputField, state,setState, required} = props;

    const cnt = inputField.length;

    const inputs = [];


    // Go through fields assigning divs depending on types
    // Date, Text, TextArea, Checkbox, Dropdown,
    for (let i = 0; i < cnt; i++) {
        const id = `id_${i}`;
        let name = inputField[i].name;
        let label = inputField[i].label;
        const isRequired = required.includes(name);
        let fieldType = inputField[i].type;

        // Text field
        if(fieldType === "text"){
            inputs.push(
                <div key={id} className={"panel-input-row"}>
                    <InputLabel
                        labelFor={id}
                        label={label}
                        className = {'panel-label'}
                    />
                    <TextInput
                        name={name}
                        id={id}
                        className="form-control"
                        value={state[name]?.value || ""}
                        onChange={(event) => handleInputChange(event,setState)}
                        required={isRequired}
                        autoFocus={false}
                    />
                </div>
            );
        }
        else if(fieldType === "textarea") { // Text Area field
            inputs.push(
                <div key={id} className="panel-input-row">
                    <InputLabel
                        labelFor={id}
                        label={label}
                        className={"panel-label"}
                    />
                    <textarea
                        name={name}
                        id={id}
                        className="form-control"
                        rows={3}
                        value={state[name]?.value || ""}
                        onChange={(event) => handleInputChange(event,setState)}
                        required={isRequired}
                        autoFocus={false}
                    />
                </div>
            );
        }
        else if(fieldType === "checkbox") { // Checkbox field
            inputs.push(
                <div key={id} className={"panel-input-row"}>
                    <InputLabel
                        labelFor={id}
                        label={label}
                        className={"panel-label"}
                    />
                    <Checkbox
                        name={name}
                        id={id}
                        className="form-control"
                        value={state[name]?.value || ""}
                        onChange={(event) => handleInputChange(event,setState)}
                        required={isRequired}
                    />
            </div>
            );
        }
        else if(fieldType === "dropdown"){ // Dropdown field
            const options = inputField[i].options;
            inputs.push(
                <div key={id} className={"panel-input-row"}>
                    <InputLabel
                        labelFor={id}
                        label={label}
                        className = {'panel-label'}
                    />
                    <DropdownSearch
                        options={options}
                        initialvalue={null}
                        name={name}
                        id={id}
                        classname="navbar__search-form"
                        required={isRequired}
                        isClearable={true}
                        value={state[name]?.value || ""}
                        setState={setState}
                    />
                </div>
            );
        }
        else if(fieldType === "date"){
            const calendarEl = inputField[i].calendarEl;
            inputs.push(
                <div key={id} className="panel-input-row">
                    <InputLabel
                        labelFor={id}
                        label={label}
                        className={'panel-label'}
                    />
                    <DatePicker
                        id={id}
                        ref={(r) => (calendarEl.current = r)}
                        showTimeSelect
                        dateFormat="yyyy-MM-dd HH:mm"
                        todayButton="Today"
                        selected={
                            (typeof state[name].value === 'string' || state[name].value instanceof String)
                            ?  Date.parse(state[name].value)
                            : state[name].value
                        }
                        className="form-control"
                        name={name}
                        onChange={(date) => handleDateChange(name, date, setState)}
                        customInput={
                            <DateInput
                                opendate={() => openDatepicker(calendarEl)}
                                iconpath={`${ActionURL.getContextPath()}/wnprc_ehr/static/images/icons8-calendar-24.png`}/>
                        }
                        popperClassName={"my-datepicker-popper"}
                    />
                </div>
            );
        }
    }
    return (<>{inputs}</>);
}
export default BulkFormInput;

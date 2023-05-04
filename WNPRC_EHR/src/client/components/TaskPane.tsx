import * as React from "react";
import { FC, useEffect, useRef, useState } from 'react';
import TextInput from './TextInput';
import InputLabel from './InputLabel';
import "../theme/css/index.css";
import { ConfigProps } from '../weight/typings/main';
import DropdownSearch from './DropdownSearch';
import DateInput from './DateInput';
import { ActionURL, Utils } from '@labkey/api';
import DatePicker from 'react-datepicker';
import {openDatepicker, handleDateChange, handleInputChange, findDropdownOptions} from '../query/helpers';
import { TaskValuesType } from '../typings/taskPaneTypes';

export const TaskPane: FC<any> = (props) =>{

    const {id, status, title, onStateChange, formType} = props;

    const [taskState, setTaskState] = useState<TaskValuesType>({
        taskid: { value: id || Utils.generateUUID().toUpperCase(), error: "" },
        title: { value: title, error: "" },
        assignedto: { value: null, error: "" },
        category: {value: 'task', error: ""},
        duedate: { value: new Date(), error: "" },
        formtype: {value: formType, error: ""},
        qcstate: { value: status, error: "" },
    });

    const [assignTypes, setAssignTypes] = useState<Array<any>>([]);

    let calendarEl = useRef(null);

    // Updates state in form container
    useEffect(() => {
        onStateChange(taskState);
    }, [taskState]);

    // Finds users for dropdown
    useEffect(() => {
        let config: ConfigProps = {
            schemaName: "core",
            queryName: "PrincipalsWithoutAdmin",
            columns: ["DisplayName", "UserId"]
        };
        findDropdownOptions(config,setAssignTypes,'UserId', 'DisplayName');
    }, []);

    return(
        <>
            <div className="panel-heading">
                <h3>Task</h3>
            </div>
            <div className={"default-form"}>
                <div className={"panel-input-row"}>
                    <InputLabel
                        labelFor={'taskid'}
                        label={'Task Id'}
                        className = {'panel-label'}
                    />
                    <TextInput
                        name={"taskid"}
                        id={`id_${'taskId'}`}
                        className="form-control"
                        value={taskState.taskid.value}
                        onChange={(event) => handleInputChange(event, setTaskState)}
                        required={false}
                        autoFocus={false}
                        readOnly={true}
                        type={id ? "text": "hidden"}
                    />
                </div>
                <div className={"panel-input-row"}>
                    <InputLabel
                        labelFor={'title'}
                        label={'Title'}
                        className = {'panel-label'}
                    />
                    <TextInput
                        name="title"
                        id={`id_${'taskTitle'}`}
                        className="form-control"
                        onChange={(event) => handleInputChange(event, setTaskState)}
                        value={taskState.title.value}
                        required={true}
                        autoFocus={false}
                    />
                </div>

                <div className={"panel-input-row"}>
                    <InputLabel
                        labelFor={'assignedto'}
                        label={'Assigned To'}
                        className = {'panel-label'}
                    />
                    <DropdownSearch
                        options={assignTypes}
                        initialvalue={null}
                        name="assignedto"
                        id={`id_${'taskAssignedTo'}`}
                        classname="navbar__search-form"
                        required={true}
                        isClearable={true}
                        value={taskState.assignedto.value}
                        setState={setTaskState}
                    />
                </div>

                <div className={"panel-input-row"}>
                    <InputLabel
                        labelFor={'duedate'}
                        label={'Due Date'}
                        className = {'panel-label'}
                    />
                    <DatePicker
                        ref={(r) => (calendarEl.current = r)}
                        showTimeSelect
                        dateFormat="yyyy-MM-dd HH:mm"
                        todayButton="Today"
                        selected={taskState.duedate.value}
                        className="form-control"
                        name="duedate"
                        onChange={(date) => handleDateChange("duedate",date,setTaskState)}
                        customInput={
                            <DateInput
                                opendate={() => openDatepicker(calendarEl)}
                                iconpath={`${ActionURL.getContextPath()}/wnprc_ehr/static/images/icons8-calendar-24.png`}/>
                        }
                        popperClassName={"my-datepicker-popper"}
                    />
                </div>
                <div className={"panel-input-row"}>
                    <InputLabel
                        labelFor={'qcstate'}
                        label={'Status'}
                        className={'panel-label'}
                    />
                    <TextInput
                        name="qcstate"
                        id={`id_${'taskQCStateLabel'}`}
                        className="form-control"
                        value={taskState.qcstate.value}
                        onChange={(e) => handleInputChange(e,setTaskState)}
                        required={false}
                        autoFocus={false}
                        readOnly={true}
                    />
                </div>
            </div>
        </>
    );
}





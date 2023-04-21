import * as React from "react";
import { FC, useEffect, useRef, useState } from 'react';
import TextInput from './TextInput';
//import {TextInput} from "@labkey/components";
import InputLabel from './InputLabel';
import "../theme/css/index.css";
import { ConfigProps } from '../weight/typings/main';
import DropdownSearch from './DropdownSearch';
import DateInput from './DateInput';
import { ActionURL } from '@labkey/api';
import DatePicker from 'react-datepicker';
import {openDatepicker, handleDateChange, handleInputChange, findDropdownOptions} from '../query/helpers';

export const TaskPane: FC<any> = (props) =>{

    const {id, status, title, onStateChange} = props;

    const [taskState, setTaskState] = useState({
        taskId: id,
        taskTitle: title,
        taskAssign: null,
        dueDate: new Date(),
        taskStatus: status
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
                        labelFor={'taskId'}
                        label={'Task Id'}
                        className = {'panel-label'}
                    />
                    <TextInput
                        name="taskId"
                        id={`id_${'taskId'}`}
                        className="form-control"
                        value={taskState.taskId}
                        onChange={(event) => handleInputChange(event, setTaskState)}
                        required={false}
                        autoFocus={false}
                        readOnly={true}
                    />
                </div>
                <div className={"panel-input-row"}>
                    <InputLabel
                        labelFor={'taskTitle'}
                        label={'Title'}
                        className = {'panel-label'}
                    />
                    <TextInput
                        name="taskTitle"
                        id={`id_${'taskTitle'}`}
                        className="form-control"
                        onChange={(event) => handleInputChange(event, setTaskState)}
                        value={taskState.taskTitle}
                        required={true}
                        autoFocus={false}
                    />
                </div>

                <div className={"panel-input-row"}>
                    <InputLabel
                        labelFor={'taskAssign'}
                        label={'Assigned To'}
                        className = {'panel-label'}
                    />
                    <DropdownSearch
                        options={assignTypes}
                        initialvalue={null}
                        name="taskAssign"
                        id={`id_${'taskAssign'}`}
                        classname="navbar__search-form"
                        required={true}
                        isClearable={true}
                        value={taskState.taskAssign}
                        setState={setTaskState}
                    />
                </div>

                <div className={"panel-input-row"}>
                    <InputLabel
                        labelFor={'dueDate'}
                        label={'Due Date'}
                        className = {'panel-label'}
                    />
                    <DatePicker
                        ref={(r) => (calendarEl.current = r)}
                        showTimeSelect
                        dateFormat="yyyy-MM-dd HH:mm"
                        todayButton="Today"
                        selected={taskState.dueDate}
                        className="form-control"
                        name="dueDate"
                        onChange={(date) => handleDateChange("dueDate",date,setTaskState)}
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
                        labelFor={'taskStatus'}
                        label={'Status'}
                        className={'panel-label'}
                    />
                    <TextInput
                        name="taskStatus"
                        id={`id_${'status'}`}
                        className="form-control"
                        value={taskState.taskStatus}
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





import * as React from "react";
import { FC, useEffect, useState } from 'react';
import TextInput from './TextInput';
import InputLabel from './InputLabel';
import "../theme/css/index.css";
import { ConfigProps } from '../weight/typings/main';
import DropdownSearch from './DropdownSearch';
import { getQCLabel } from '../query/helpers';
import ControlledDateInput from './ControlledDateInput';
import { useFormContext } from 'react-hook-form';

export const TaskPane: FC<any> = (props) =>{
    const { title, prevTask} = props;

    const {setValue} = useFormContext();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const config: ConfigProps = {
        schemaName: "core",
        queryName: "PrincipalsWithoutAdmin",
        columns: ["UserId", "DisplayName"]
    };

    // Finds prev QC label if a prev task was created
    useEffect(() => {
        if(prevTask) {
            console.log("PT: ", prevTask);
            getQCLabel(prevTask.qcstate).then((r) => {
                setValue("TaskPane.qcstate",r.Label);
            });

            setIsLoading(false);
        }else{
            setIsLoading(false);
        }
    }, []);

    if(isLoading){
        return <div>Loading...</div>
    }
    return(
        <div className={"col-md-8 panel panel-portal form-row-wrapper"}>
            <div className="panel-heading">
                <h3>Task</h3>
            </div>
            <div className={"multi-col-form"}>
                <div className={"panel-input-row"}>
                    <InputLabel
                        labelFor={'taskRowId'}
                        label={'Task Id'}
                        className = {'panel-label'}
                    />
                    <TextInput
                        name={`TaskPane.rowid`}
                        id={'taskRowId'}
                        className="form-control"
                        value={prevTask?.rowid || undefined}
                        required={false}
                        readOnly={true}
                        type={prevTask ? "text": "hidden"}
                    />
                </div>
                <div className={"panel-input-row"}>
                    <InputLabel
                        labelFor={'taskTitle'}
                        label={'Title'}
                        className = {'panel-label'}
                    />
                    <TextInput
                        name={"TaskPane.title"}
                        id={"taskTitle"}
                        className="form-control"
                        value={prevTask?.title || title}
                        required={true}
                    />
                </div>

                <div className={"panel-input-row"}>
                    <InputLabel
                        labelFor={'taskAssignedTo'}
                        label={'Assigned To'}
                        className = {'panel-label'}
                    />
                    <DropdownSearch
                        initialValue={prevTask?.assignedto || undefined}
                        optConf={config}
                        name={"TaskPane.assignedto"}
                        id={"taskAssignedTo"}
                        classname="navbar__search-form"
                        required={true}
                        isClearable={true}
                    />
                </div>
                <div className={"panel-input-row"}>
                    <InputLabel
                        labelFor={'taskDueDate'}
                        label={'Due Date'}
                        className = {'panel-label'}
                    />
                    <ControlledDateInput
                        name={"TaskPane.duedate"}
                        id={"taskDueDate"}
                        date={prevTask?.duedate ? new Date(prevTask.duedate) : new Date()}
                    />
                </div>
                <div className={"panel-input-row"}>
                    <InputLabel
                        labelFor={'taskQCStateLabel'}
                        label={'Status'}
                        className={'panel-label'}
                    />
                    <TextInput
                        name={"TaskPane.qcstate"}
                        id={'taskQCStateLabel'}
                        className={"form-control"}
                        value={prevTask?.qcstate || "In Progress"}
                        required={false}
                        readOnly={true}
                    />
                </div>
            </div>
        </div>
    );
}





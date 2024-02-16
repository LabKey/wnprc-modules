import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import TextInput from './TextInput';
import InputLabel from './InputLabel';
import '../theme/css/index.css';
import { ConfigProps } from '../query/typings';
import DropdownSearch from './DropdownSearch';
import { getTask, labkeyActionSelectWithPromise } from '../query/helpers';
import ControlledDateInput from './ControlledDateInput';
import { Controller, FieldPathValue, FieldValues, useFormContext } from 'react-hook-form';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';


interface taskProps {
    componentProps: {
        title: string;
        schemaName: string;
        queryName: string;
    }
    prevTaskId?: string;
}

export const TaskPane: FC<taskProps> = (props) =>{
    const {prevTaskId, componentProps} = props;
    const { title} = componentProps;

    const { control } = useFormContext();
    const [prevTask, setPrevTask] = useState(undefined);
    const [isLoadingTask, setIsLoadingTask] = useState<boolean>(true);
    const [isLoadingQC, setIsLoadingQC] = useState<boolean>(true);

    const [qcOptions, setQCOptions] = useState<any>({});

    const config: ConfigProps = {
        schemaName: "core",
        queryName: "PrincipalsWithoutAdmin",
        columns: ["UserId", "DisplayName"]
    };

    const qcConfig: SelectRowsOptions = {
        schemaName: "core",
        queryName: "QCState",
        columns: ["RowId", "label"],
    };

    const getQCLabel = (value) => {
        return qcOptions[value];
    }
    const getQCRow = (label) => {
        for(const key in qcOptions){
            if(qcOptions.hasOwnProperty(key) && qcOptions[key] === label){
                return key;
            }
        }
    }

    // Loads previous task if one exists
    useEffect(() => {
        if(prevTaskId) {
            getTask(prevTaskId).then((result) => {
                setPrevTask(result);
                setIsLoadingTask(false);
            });
        }else {
            setIsLoadingTask(false);
        }
    },[]);

    // Gets QC labels and row ids
    useEffect(() => {
        labkeyActionSelectWithPromise(qcConfig).then((data) => {
            const qcOpt = {};
            data.rows.forEach((row) => {
                qcOpt[row.RowId] = row.Label;
            });
            setQCOptions(qcOpt);
            setIsLoadingQC(false);
        }).catch(() => {
            setIsLoadingQC(false);
        })
    }, []);


    if(isLoadingQC || isLoadingTask){
        return <div>Loading...</div>
    }
    return(
        <>
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
                    <Controller
                        name={"TaskPane.qcstate" as  FieldPathValue<FieldValues, any>}
                        control={control}
                        defaultValue={prevTask?.qcstate as FieldPathValue<FieldValues, any> || getQCRow("In Progress") as FieldPathValue<FieldValues, any>}
                        render={({field: {onChange, value}}) => (
                            <div className={"text-input"}>
                                <input
                                    id={'taskQCStateLabel'}
                                    className={"form-control"}
                                    value={getQCLabel(value) as FieldPathValue<FieldValues, any>}
                                    onChange={(e) => {
                                        getQCRow(e.target.value);
                                    }}
                                    required={false}
                                    type={'text'}
                                    readOnly={true}
                                />
                            </div>
                        )}
                    />
                </div>
            </div>
        </>
    );
}





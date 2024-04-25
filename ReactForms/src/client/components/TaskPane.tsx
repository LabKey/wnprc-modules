import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import TextInput from './TextInput';
import InputLabel from './InputLabel';
import '../theme/css/index.css';
import { ConfigProps } from '../query/typings';
import DropdownSearch from './DropdownSearch';
import { labkeyActionSelectWithPromise } from '../query/helpers';
import ControlledDateInput from './ControlledDateInput';
import { Controller, FieldPathValue, FieldValues, useFormContext } from 'react-hook-form';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';


interface taskProps {
    schemaName: string;
    queryName: string;
    prevTaskId?: string;
    apiData: any;
}

export const TaskPane: FC<taskProps> = (props) =>{
    const { schemaName, queryName, apiData} = props;
    const { control} = useFormContext();
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


    if(isLoadingQC){
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
                        name={`${schemaName}-${queryName}.rowid`}
                        id={'taskRowId'}
                        className="form-control"
                        required={false}
                        readOnly={true}
                        type={"text"}
                    />
                </div>
                <div className={"panel-input-row"}>
                    <InputLabel
                        labelFor={'taskTitle'}
                        label={'Title'}
                        className = {'panel-label'}
                    />
                    <TextInput
                        name={`${schemaName}-${queryName}.updateTitle`}
                        id={"taskTitle"}
                        className="form-control"
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
                        optConf={config}
                        newDefaults={apiData["assignedto"]}
                        name={`${schemaName}-${queryName}.assignedto`}
                        id={"taskAssignedTo"}
                        classname="navbar__search-form"
                        required={false}
                        controlled={true}
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
                        name={`${schemaName}-${queryName}.duedate`}
                        id={"taskDueDate"}
                    />
                </div>
                <div className={"panel-input-row"}>
                    <InputLabel
                        labelFor={'taskQCStateLabel'}
                        label={'Status'}
                        className={'panel-label'}
                    />
                    <Controller
                        name={`${schemaName}-${queryName}.qcstate` as  FieldPathValue<FieldValues, any>}
                        control={control}
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





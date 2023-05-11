import { FC, useEffect, useState } from 'react';
import { ConfigProps } from '../weight/typings/main';
import { handleInputChange, findDropdownOptions, getFormData } from '../query/helpers';
import InputLabel from './InputLabel';
import * as React from 'react';
import DropdownSearch from './DropdownSearch';
import { RestraintPaneTypes } from '../typings/restraintPaneTypes';
import { Utils } from '@labkey/api';

export const RestraintPane: FC<any> = (props) => {
    const {onStateChange, prevTaskId} = props;
    const [restraintTypes, setRestraintTypes]  = useState<Array<any>>([]);

    const [resState, setResState] = useState<RestraintPaneTypes>({
        Id: {error: '', value: ''},
        date: {error: '', value: new Date()},
        objectid: {error: '', value: Utils.generateUUID().toUpperCase()},
        remark: {error: '', value: ''},
        restraintType: {error: '', value: ''},
        taskid: {error: '', value: ""},
    });

    // Grab previous restraints data from task id if it exists
    useEffect(() => {
        if(prevTaskId){
            getFormData(prevTaskId,"study","restraints").then((result) => {
                setResState(prevState => {
                    let newState = {};
                    for (let name in result) {
                        newState[name] = { value: result[name], error: "" };
                    }
                    return { ...prevState, ...newState };
                });
            });
        }
    },[]);

    // Update higher form state
    useEffect(() => {
        onStateChange(resState);
    },[resState]);

    // Find options for restraint dropdown
    useEffect(() => {
        let config: ConfigProps = {
            schemaName: "ehr_lookups",
            queryName: "restraint_type",
            columns: ["type", "code"]
        };
        findDropdownOptions(config,setRestraintTypes, 'type','type');
    }, []);

    return(
        <>
            <div className="panel-heading">
                <h3>Restraint</h3>
            </div>
            <div className={"default-form"}>
                <div className={"panel-input-row"}>
                    <InputLabel
                        labelFor={"restraintType"}
                        label={'Restraint Type'}
                        className = {'panel-label'}
                    />
                    <DropdownSearch
                        options={restraintTypes}
                        initialvalue={null}
                        name="restraintType"
                        id={`id_${'restraintType'}`}
                        classname="navbar__search-form"
                        required={false}
                        isClearable={true}
                        value={resState.restraintType.value}
                        setState={setResState}
                    />
                </div>

                <div className={'panel-input-row'}>
                        <InputLabel
                            labelFor="remark"
                            label="Remark"
                            className={"panel-label"}
                        />
                        <textarea
                            name="remark"
                            id={`id_${"restraintRemark"}`}
                            className="form-control"
                            rows={3}
                            value={resState.remark.value || ""}
                            onChange={(event) => handleInputChange(event, setResState)}
                            required={false}
                            autoFocus={false}
                        />
                </div>
            </div>
        </>
    );
}
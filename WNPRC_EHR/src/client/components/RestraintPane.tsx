import * as react from 'react';
import { FC, useEffect, useState } from 'react';
import { ConfigProps } from '../weight/typings/main';
import { labkeyActionSelectWithPromise, handleInputChange, findDropdownOptions } from '../query/helpers';
import InputLabel from './InputLabel';
import TextInput from './TextInput';
import * as React from 'react';
import DropdownSearch from './DropdownSearch';
import { RestraintPaneTypes } from '../typings/restraintPaneTypes';
import { Utils } from '@labkey/api';

export const RestraintPane: FC<any> = (props) => {
    const {onStateChange, objectId, taskState} = props;
    const [restraintTypes, setRestraintTypes]  = useState<Array<any>>([]);

    const [resState, setResState] = useState<RestraintPaneTypes>({
        restraintAnimalId: {error: '', value: ''},
        restraintDate: {error: '', value: new Date()},
        restraintObjectId: {error: '', value: objectId || Utils.generateUUID().toUpperCase()},
        restraintRemark: {error: '', value: ''},
        restraintType: {error: '', value: ''},
    });

    // Update higher form state
    useEffect(() => {
        onStateChange(resState);
    },[resState]);

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
                            labelFor="restraintRemark"
                            label="Remark"
                            className={"panel-label"}
                        />
                        <textarea
                            name="restraintRemark"
                            id={`id_${"restraintRemark"}`}
                            className="form-control"
                            rows={3}
                            value={resState.restraintRemark.value}
                            onChange={(event) => handleInputChange(event, setResState)}
                            required={false}
                            autoFocus={false}
                        />
                </div>
            </div>
        </>
    );
}
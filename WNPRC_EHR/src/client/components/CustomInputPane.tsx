import * as React from "react";
import { FC, useEffect, useState } from 'react';
import "../theme/css/index.css";
import {
    getAnimalInfo,
    findAccount,
    getFormData
} from '../query/helpers';
import BulkFormInput from './BulkFormInput';

export const CustomInputPane: FC<any> = (props) => {
    const {
        setAnimalInfo,
        setAnimalInfoState,
        setAnimalInfoCache,
        onStateChange,
        prevTaskId,
        componentProps
    } = props;

    const {
        schemaName,
        queryName,
        title,
        inputPath
    } = componentProps;


    const {inputs, initialState, requiredInputs, dropdownOptions} = require(`../${inputPath}/customInputs`);

    // This state is strictly for the form values, more added later but these must be defined here
    const [state, setState] = useState(initialState);
    const options = dropdownOptions(state);

    // Loads previous form into state if the task already existed. ex. (Under review)
    useEffect(() => {
        if(prevTaskId){
            getFormData(prevTaskId,schemaName,queryName).then((result) => {
                setState(prevState => {
                    let newState = {};
                    for (let name in result) {
                        newState[name] = { value: result[name], error: "" };
                    }
                    return { ...prevState, ...newState };
                });
            });
        }
    },[]);

    // Finds the animal info for id
    useEffect(() => {
        getAnimalInfo(state.Id.value, setAnimalInfo, setAnimalInfoState, setAnimalInfoCache);
    },[state.Id.value]);

    // Updates state in higher form component
    useEffect(() => {
        onStateChange(state);
    },[state]);

    // Find account for project, update if project changes
    useEffect(() => {
        // Make sure form has an account input, otherwise no need to update
        if(state.account) {
            // Clears account if project is also cleared
            if (state.project.value === null) {
                setState({...state, account: {value: "", error: ""}});
                return;
            }
            findAccount(state.project.value).then(newAccount => {
                setState({...state, account: newAccount});
            });
        }
    }, [state.project.value]);

    return (
        <div>
            <div className="panel-heading">
                <h3>{title}</h3>
            </div>
            <div className={'multi-col-form'}>
                <BulkFormInput
                    inputField={inputs}
                    state={state}
                    setState={setState}
                    required={requiredInputs}
                    options={options}
                />
            </div>
        </div>
    );
}

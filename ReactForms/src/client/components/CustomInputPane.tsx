import * as React from "react";
import { FC, useEffect, useState } from 'react';
import "../theme/css/index.css";
import {getFormData} from '../query/helpers';
import BulkFormInput from './BulkFormInput';

export const CustomInputPane: FC<any> = (props) => {
    const {
        prevTaskId,
        componentProps,
        name
    } = props;

    const {
        schemaName,
        queryName,
        title,
        inputs,
        initialState,
        dropdownOptions
    } = componentProps;

    // This state is strictly for the form values, more added later but these must be defined here
    const [prevFormState, setPrevFormState] = useState(initialState);

    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Loads previous form into state if the task already existed. ex. (Under review)
    useEffect(() => {
        if(prevTaskId){
            getFormData(prevTaskId,schemaName,queryName).then((result) => {
                setPrevFormState(prevState => {
                    let newState = {};
                    for (let compName in result) {
                        newState[compName] = result[compName];
                    }
                    return { ...prevState, ...newState };
                });
                setIsLoading(false);
            }).catch(() => {
                setIsLoading(false);
            });
        }else{
            setIsLoading(false);
        }
    },[]);

    if(isLoading){
        return(<div>Loading...</div>);
    }
    return (
        <div>
            <div className="panel-heading">
                <h3>{title}</h3>
            </div>
            <div className={'multi-col-form'}>
                <BulkFormInput
                    inputField={inputs}
                    prevForm={prevFormState}
                    compName={name}
                    dropdownOptions={dropdownOptions}
                />
            </div>
        </div>
    );
}

import * as React from "react";
import { FC, useEffect, useState } from 'react';
import "../theme/css/index.css";
import {getFormData} from '../query/helpers';
import BulkFormInput from './BulkFormInput';
import { useFormContext } from 'react-hook-form';

export const CustomInputPane: FC<any> = (props) => {
    const {
        prevTaskId,
        componentProps,
        name,
        schemaName,
        queryName,
        metaData
    } = props;

    const {
        title,
        inputs,
        wnprcMetaData
    } = componentProps;

    // This state is strictly for the form values, more added later but these must be defined here
    console.log("MD: ", metaData);
    return (
        <div key={name}>
            <div className="panel-heading">
                <h3>{title}</h3>
            </div>
            <div className={'multi-col-form'}>
                <BulkFormInput
                    inputField={metaData}
                    compName={`${schemaName}-${queryName}`}
                    wnprcMetaData={wnprcMetaData}
                />
            </div>
        </div>
    );
}

import * as React from "react";
import { FC, useEffect, useState } from 'react';
import "../theme/css/index.css";
import BulkFormInput from './BulkFormInput';

export const CustomInputPane: FC<any> = (props) => {
    const {
        componentProps,
        name,
        schemaName,
        queryName,
        metaData
    } = props;

    const {
        title,
        wnprcMetaData
    } = componentProps;

    // This state is strictly for the form values, more added later but these must be defined here
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

import { FC, useEffect, useState } from 'react';

// metaDataProps is the collection properties that is passsed into this function.
interface metaDataProps {
    startTime: Date;
    schemaName: string;
    queryName: string;
    taskid: string;
    recordNum?: number;
}

// fullMetaData is the entire collection of meta data that is finalized in this function
interface fullMetaData {
    startTime: Date;
    endTime: Date;
    schemaName: string;
    queryName: string;
    taskid: string;
    recordNum?: number;
    batchAdd?: boolean;
    batchEdit?: boolean;
    userAgent: string;
    errors?: boolean;

}
export const FormMetadataCollection = (metaDataProps: metaDataProps): fullMetaData => {
    // Converts date to YYYY-MM-DD HH:MM format
    const endTime: Date = new Date(new Date().toISOString().slice(0, 16).replace('T', ' '));
    const metaData: fullMetaData = {
        ...metaDataProps,
        endTime: endTime,
        userAgent: navigator.userAgent,
        recordNum: metaDataProps?.recordNum ?? 1
    };



    return metaData;
}

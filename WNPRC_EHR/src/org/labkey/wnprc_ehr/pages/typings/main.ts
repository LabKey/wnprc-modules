import { CommandType } from "@labkey/api/dist/labkey/query/Rows";

export interface ConfigProps {
    schemaName: string;
    queryName: string;
    columns?: any;
    sort?: string;
    containerPath?: string;
    filterArray?: Array<any>;
}

export interface ContextProviderProps{
    setFormDataInAppContext: (formData: Array<any>) => void;
}

export type DataRowsPerCommandType = {
    CommandType: Array<RowObj>;
}
export interface ModifyRowsCommands {
    schemaName: string;
    queryName: string;
    command: CommandType
    rows: Array<any>;
}

export interface RowMemberObj {
    value: string | number | object | boolean;
    error: string;
}

export interface RowObj {
    animalid: RowMemberObj;
    date: RowMemberObj;
    QCState: RowMemberObj;
    objectid: RowMemberObj;
    lsid: RowMemberObj;
    command: RowMemberObj;
    collapsed: RowMemberObj;
    visibility: RowMemberObj;
    validated: RowMemberObj;
}
export type WaterAmountValuesType = {
    Id: string;
    QCStateLabel: string;
    date: string;
    project: number;
    volume: number;
    provideFruit: string;
    assignedTo: string;
    frequency: string;
    waterOrderObjectId: string;
    recordSource: string;
    waterSource: string;
    taskid: string;
}

export type TaskValuesType = {
    taskId: string;
    duedate: string;
    assignedTo: number;
    category: string;
    title: string;
    formType: string;
    QCStateLabel: string;
}

export type Commands = {
    commands: Array<ModifyRowsCommands>
}
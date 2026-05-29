/*
 * Copyright (c) 2022-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
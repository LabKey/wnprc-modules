import {AnimalInfoProps, AnimalInfoStates} from "../../typings/main";
import { CommandType } from "@labkey/api/dist/labkey/query/Rows";

export interface InfoProps {
    Id: string;
    _labkeyurl_Id: string;
    calculated_status: string;
    _labkeyurl_calculated_status: string;
    gender: string;
    _labkeyurl_gender: string;
    dam: string;
    _labkeyurl_dam: string;
    birth: string;
    _labkeyurl_birth: string;
    medical: string;
}

export interface PaneProps {
    animalInfo: InfoProps;
    infoState?: string;
}

export interface BatchModalProps {
    setLocation: (loc: Array<any>) => void;
    setIds: (ids: Array<any>) => void;
    flipState: () => void;
}

export interface BulkEditModalProps {
    liftUpBulkValues: (values: object) => void;
    flipState: () => void;
    restraints: any;
}

export interface BulkEditFormValues {
    weight: object;
    date: object;
    remark: object;
    restraint: object;
}

export interface ConfigProps {
    schemaName: string;
    queryName: string;
    columns?: any;
    sort?: string;
    containerPath?: string;
    filterArray?: Array<any>;
}

export interface ContextProviderProps {
    submitted: boolean;
    submit: () => void;
    setRestraintsInAppContext: (restraints: Array<any>) => void;
    restraints: Array<any>;
    setStartTimeInAppContext: (startTime: object) => void;
    setEndTimeInAppContext: (endTime: object) => void;
    formdata: Array<any>;
    setFormDataInAppContext: (formData: Array<any>) => void;
    setTaskIdInAppContext: (taskID: string) => void;
    taskId: string;
    formFrameworkTypes: string;
    setFormFrameworkTypesInAppContext: (fff: object) => void;
    wasSaved: boolean;
    setWasSavedInAppContext: (wasSaved: boolean) => void;
    isRecording: boolean;
    setIsRecordingInAppContext: (isRecording: boolean) => void;
    bulkEditUsed: boolean;
    setBulkEditUsedInAppContext: () => void;
    batchAddUsed: boolean;
    setBatchAddUsedInAppContext: () => void;
    anyErrorsEver: boolean;
    setAnyErrorsEverInAppContext: () => void;
}

export interface CustomAlertProps {
    body: string;
    show: boolean;
    variant?:
      | 'primary'
      | 'secondary'
      | 'success'
      | 'danger'
      | 'warning'
      | 'info'
      | 'dark'
      | 'light';
    onClose: () => void;
    dismissable: boolean;
}

export interface DropdownOptionsProps {
    options: Array<any>;
    value: any;
    name: string;
    id: string;
    classname: string;
    valuekey: string;
    displaykey: string;
    initialvalue: string;
}

export interface SubmitForReviewModalProps {
    action: any;
    setreviewer: (reviewer: number) => void;
    flipState:() => void;
}

export interface SubmitModalProps {
    name: string;
    title: string;
    bodyText: any;
    submitText: string;
    enabled: boolean;
    submitAction: () => void;
    flipState: () => void;
}

export interface WeightFormProps {
    animalid?: string;
    weight?: number;
    date?: object;
    restraint?: string;
    remark?: string;
    index?: number;
    infoState?: (infoState: AnimalInfoStates) => void;
    liftUpVal?: (name: string, value: any, index: number) => void;
    liftUpAnimalInfo: (animalInfo: AnimalInfoProps) => void;
    liftUpErrorLevel: (errorLevel: string) => void;
    liftUpValidation: (name: string, value: any, index: number) => void;
}

export interface ModifyRowsCommands {
    schemaName: string;
    queryName: string;
    command: CommandType
    rows: Array<any>;
}

export interface jsonDataType {
    commands: object;
}

export interface RowMemberObj {
    value: string | number | object | boolean;
    error: string;
}

export interface RowObj {
    animalid: RowMemberObj;
    date: RowMemberObj;
    weight?: RowMemberObj;
    remark: RowMemberObj;
    QCState: RowMemberObj;
    objectid: RowMemberObj;
    restraint_objectid: RowMemberObj;
    lsid: RowMemberObj;
    command: RowMemberObj;
    collapsed: RowMemberObj;
    visibility: RowMemberObj;
    restraint: RestraintObj;
    validated: RowMemberObj;
}

export interface UserEditableWeightFormValues {
    weight: RowMemberObj;
    date: RowMemberObj;
    restraint: RestraintObj;
    remark: RowMemberObj
}

//TODO add everything thats in the setupRestraintValues (date, taskid)
export interface RestraintObj {
    value: string;
    objectid: string;
    error: string;
}

export type DataRowsPerCommandType = {
    CommandType: Array<RowObj>;
}

export interface BulkEditFieldProps {
    fieldValues: (values: object) => void;
    restraints: Array<any>;
}

export type InsertValuesWithCommand = {
    CommandType: any;
}

export type WeightValuesType = {
    Id: string;
    QCStateLabel: string;
    date: string;
    weight: number;
    remark: string;
    taskid: string;
    objectid: string;
    restraint_objectid: string;
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

export type RestraintValuesType = {
    Id: string;
    restraintType: string;
    taskid: string
    objectid: string;
    date: string;
}

export type Commands = {
    commands: Array<ModifyRowsCommands>
}

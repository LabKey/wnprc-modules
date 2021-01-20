import {AnimalInfoProps, AnimalInfoStates} from "../../typings/main";
import { CommandType } from "@labkey/api/dist/labkey/query/Rows";

export interface InfoProps {
    Id: string;
    _labkeyurl_Id: string;
    calculated_status: string;
    _labkeyurl_calculated_status: string;
    gender: string;
    _labkeyurl_genderd: string;
    dam: string;
    _labkeyurl_dam: string;
    birth: string;
    _labkeyurl_birth: string;
}

export interface ConfigProps {
    schemaName: string;
    queryName: string;
    columns?: any;
    sort?: string;
    containerPath?: string;
    filterArray?: Array<any>;
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

export type GroupCommandType = {
    [key in CommandType]: object;
};;


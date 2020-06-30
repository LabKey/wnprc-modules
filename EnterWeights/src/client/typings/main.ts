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

//TODO add more global interfaces
export interface jsonDataType {
    commands: object;
}

export interface labkeyDataType {
    
}


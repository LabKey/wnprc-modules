export interface ConfigProps {
  schemaName: string;
  queryName: string;
  columns?: any;
  sort?: string;
  containerPath?: string;
  filterArray?: Array<any>;
}


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
  medical: string;
  _labkeyurl_gender: string;
}

export type infoStates =
    | "waiting"
    | "loading"
    | "loading-unsuccess"
    | "loading-success";


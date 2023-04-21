export interface ContextProps {
  animalInfo: any;
  animalInfoState: string;
  setAnimalInfoState: any;
  setAnimalInfo: any;
  taskStatus: any;
  setTaskStatus: any;
  taskTitle: any;
  setTaskTitle: any;
  validId: any;
  setValidId: any;
  formData: any;
  animalInfoCache: any;
  setAnimalInfoCache: any;

}

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
}

export type infoStates =
    | "waiting"
    | "loading"
    | "loading-unsuccess"
    | "loading-success";


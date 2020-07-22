export interface ContextProps {
  setQueryDetailsExternal: any;
  queryDetails: any;
  setFormDataExternal: any;
  formData: any;
  animalInfo: any;
  setAnimalInfoExternal: any;
  animalInfoState: any;
  setAnimalInfoStateExternal: any;
  editMode: any;
  setEditMode: any;
  feedingTypes: any;
  animalIds: any;
  setAnimalIdsExternal: any;
  updateFormDataExternal: any;
  setBulkEditValuesExternal: any;
  updateAnimalInfoCacheExternal: any;
  animalInfoCache: any;
  errorText: any;
  setErrorTextExternal: any;
}

export interface ConfigProps {
  schemaName: string;
  queryName: string;
  columns?: any;
  sort?: string;
  containerPath?: string;
  filterArray?: Array<any>;
}

export interface RowMemberObj {
  value: any;
  error: string;
}

export interface RowObj {
  Id: RowMemberObj;
  date: RowMemberObj;
  type?: RowMemberObj;
  remark: RowMemberObj;
  amount: RowMemberObj;
  lsid: RowMemberObj;
  QCStateLabel?: RowMemberObj;
  QCState?: RowMemberObj;
  command: RowMemberObj;
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

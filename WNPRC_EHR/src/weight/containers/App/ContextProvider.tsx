import * as React from 'react';
import {createContext, useState,  useEffect} from 'react';
import {saveRowsDirect} from "../../../query/helpers";
import {RowObj} from "../../../feeding/typings/main";
import {Utils} from "@labkey/api";

interface ContextProps {
  submitted: boolean;
  submit: any;
  setrestraints: any;
  restraints: any;
  setStartTimeExternal: any;
  setEndTimeExternal: any;
  formdata: any;
  setFormDataExternal: any;
  setTaskIdExternal: any;
  taskId: any;
  formFrameworkTypes: any;
  setFormFrameworkTypesExternal: any;
  wasSaved: any;
  setWasSavedExternal: any;
  isRecording: any;
  setIsRecordingExternal: any;
  bulkEditUsed: boolean;
  setBulkEditUsedExternal: () => void;
  batchAddUsed: boolean;
  setBatchAddUsedExternal: () => void;
  anyErrorsEver: boolean;
  setAnyErrorsEverExternal: () => void;
}

const AppContext = createContext({} as ContextProps);

function ContextProvider({ children }) {
  const [submitted, setSubmitted] = useState(false);
  const [restraints, setRestraints] = useState(null);
  const [startTime, setStartTime] = useState<any>();
  const [endTime, setEndTime] = useState<any>();
  const [formdata, setFormData] = useState<Array<RowObj>>([]);
  const [taskId, setTaskId] = useState<string>(
    Utils.generateUUID().toUpperCase()
  );
  const [formFrameworkTypes, setFormFrameworkTypes] = useState<string>();
  const [wasSaved, setWasSaved] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [bulkEditUsed, setBulkEditUsed] = useState<boolean>(false);
  const [batchAddUsed, setBatchAddUsed] = useState<boolean>(false);
  const [anyErrorsEver, setAnyErrorsEver] = useState<boolean>(false);

  function setFormDataExternal(formdata){
    setFormData(formdata);
  }

  function setrestraints(restraints) {
    setRestraints(restraints);
  }

  function setStartTimeExternal (startTime) {
    //we only want to set this once
    if (startTime != ''){
      setStartTime(startTime);
    }
  }
  function setEndTimeExternal (endTime){
    if (!isRecording){
      return;
    }
    setEndTime(endTime);
    setIsRecording(false);
  }

  function setTaskIdExternal(taskId){
    setTaskId(taskId);
  }

  function setFormFrameworkTypesExternal(formFrameworkTypes){
    setFormFrameworkTypes(formFrameworkTypes);
  }

  function setWasSavedExternal(wasSaved){
    setWasSaved(wasSaved);
  }

  function setIsRecordingExternal(isRecording){
    setIsRecording(isRecording);
  }

  function setBulkEditUsedExternal(){
    setBulkEditUsed(true);
  }

  function setBatchAddUsedExternal(){
    setBatchAddUsed(true);
  }

  function setAnyErrorsEverExternal(){
    setAnyErrorsEver(true);
  }

  const logSessionTime = () => {
    let commands =[];
    let vals = {
      start_time: startTime ,
      end_time: endTime,
      schema_name: 'study',
      query_name: 'weight',
      number_of_records: formdata.length,
      batch_add_used: batchAddUsed,
      bulk_edit_used: bulkEditUsed,
      task_id: taskId,
      user_agent: navigator.userAgent,
      errors_occurred: anyErrorsEver,
      form_framework_type: formFrameworkTypes[0]["rowid"]
    }
    commands.push({
      schemaName: "wnprc",
      queryName: "session_log",
      command: 'insert',
      rows: [vals]
    })
    let jsonData = {commands: commands};
    saveRowsDirect(jsonData);
  }
  useEffect(()=> {
    if (endTime == null)
      return;
    logSessionTime();
  },[endTime])

  function submit() {
    setSubmitted(true);
  }

  const defaultContext = {
    submitted,
    submit,
    setrestraints,
    restraints,
    setStartTimeExternal,
    setEndTimeExternal,
    setFormDataExternal,
    formdata,
    setTaskIdExternal,
    taskId,
    setFormFrameworkTypesExternal,
    formFrameworkTypes,
    setWasSavedExternal,
    wasSaved,
    setIsRecordingExternal,
    isRecording,
    setBulkEditUsedExternal,
    bulkEditUsed,
    setBatchAddUsedExternal,
    batchAddUsed,
    setAnyErrorsEverExternal,
    anyErrorsEver
  };

  return (
    <AppContext.Provider value={defaultContext}>
      {children}
    </AppContext.Provider>
  );
}

export  {AppContext,ContextProvider};
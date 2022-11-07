import * as React from 'react';
import {createContext, useState,  useEffect} from 'react';
import {saveRowsDirect} from "../../../query/helpers";
import {RowObj} from "../../typings/main";
import {Utils} from "@labkey/api";
import { ContextProviderProps } from "../../typings/main";

const AppContext = createContext({} as ContextProviderProps);

function ContextProvider({ children }) {
  const [submitted, setSubmitted] = useState(false);
  const [restraints, setRestraints] = useState<Array<any>>(null);
  const [startTime, setStartTime] = useState<object>();
  const [endTime, setEndTime] = useState<object>();
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

  const setFormDataInAppContext = (formdata) => {
    setFormData(formdata);
  }

  const setRestraintsInAppContext = (restraints) => {
    setRestraints(restraints);
  }

  const setStartTimeInAppContext = (startTime) => {
    //we only want to set this once
    if (startTime != ''){
      setStartTime(startTime);
    }
  }

  const setEndTimeInAppContext = (endTime) => {
    if (!isRecording){
      return;
    }
    setEndTime(endTime);
    setIsRecording(false);
  }

  const setTaskIdInAppContext = (taskId) => {
    setTaskId(taskId);
  }

  const setFormFrameworkTypesInAppContext = (formFrameworkTypes) => {
    setFormFrameworkTypes(formFrameworkTypes);
  }

  const setWasSavedInAppContext = (wasSaved) => {
    setWasSaved(wasSaved);
  }

  const setIsRecordingInAppContext = (isRecording) => {
    setIsRecording(isRecording);
  }

  const setBulkEditUsedInAppContext = () => {
    setBulkEditUsed(true);
  }

  const setBatchAddUsedInAppContext = () => {
    setBatchAddUsed(true);
  }

  const setAnyErrorsEverInAppContext = () => {
    setAnyErrorsEver(true);
  }

  const logSessionTime = (): void => {
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

  function submit(): void {
    setSubmitted(true);
  }

  const defaultContext = {
    submitted,
    submit,
    setRestraintsInAppContext,
    restraints,
    setStartTimeInAppContext,
    setEndTimeInAppContext,
    setFormDataInAppContext,
    formdata,
    setTaskIdInAppContext,
    taskId,
    setFormFrameworkTypesInAppContext,
    formFrameworkTypes,
    setWasSavedInAppContext,
    wasSaved,
    setIsRecordingInAppContext,
    isRecording,
    setBulkEditUsedInAppContext,
    bulkEditUsed,
    setBatchAddUsedInAppContext,
    batchAddUsed,
    setAnyErrorsEverInAppContext,
    anyErrorsEver
  };

  return (
    <AppContext.Provider value={defaultContext}>
      {children}
    </AppContext.Provider>
  );
}

export  {AppContext,ContextProvider};
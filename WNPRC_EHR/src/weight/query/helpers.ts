import {
  labkeyActionSelectWithPromise,
} from "./actions";
import {Filter, Utils} from "@labkey/api";
import {
  Commands,
  ConfigProps,
  DataRowsPerCommandType,
  InsertValuesWithCommand, ModifyRowsCommands,
  RestraintValuesType,
  RowObj,
  TaskValuesType,
  WeightValuesType
} from "../typings/main";
import { CommandType } from "@labkey/api/dist/labkey/query/Rows";

//TODO implement this...
export const getSchemaMetaData = (schemaName: string, queryName: string) => {};

export const setupWeightValues = (values: Array<any>, QCStateLabel: string, taskId: string): Array<WeightValuesType> => {
  let valuesToInsert: Array<WeightValuesType> = [];
  for (let value of values){
    valuesToInsert.push({
      Id: value.animalid.value,
      QCStateLabel: QCStateLabel,
      date: value.date.value,
      weight: value.weight.value,
      remark: value.remark.value,
      taskid: taskId,
      objectid: value.objectid.value,
      restraint_objectid: value.restraint_objectid.value
      //lsid: value.lsid.value || ""
    })
  }
  return valuesToInsert;
};

export const setupTaskValues = (taskId: string, dueDate: string, assignedTo: number, QCStateLabel: string): Array<TaskValuesType> => {
  return [{
      taskId: taskId,
      duedate: dueDate,
      assignedTo: assignedTo,
      category: "task",
      title: "Weight",
      formType: "Weight",
      QCStateLabel: QCStateLabel
    }];
};

export const setupRestraintValues = (values: any[], taskId: string): Array<RestraintValuesType> => {
  let restraintValsToInsert: Array<RestraintValuesType> = [];
  for (let value of values){
    //probably still need objectid here
    restraintValsToInsert.push({
      Id: value.animalid.value,
      restraintType: value.restraint.value,
      taskid: taskId,
      objectid: value.restraint.objectid,
      date: value.date.value
    })
  }
  return restraintValsToInsert;
};

export const groupCommands = (values: Array<RowObj>): DataRowsPerCommandType => {

  return values.reduce((acc: object, item: RowObj) => {
    if (!acc[item.command.value.toString()]) {
      acc[item.command.value.toString()] = [];
    }

    acc[item.command.value.toString()].push(item);
    return acc;
  }, {} as InsertValuesWithCommand) as DataRowsPerCommandType;
};

export const enteredWeightIsGreaterThanPrevWeight = (
  weight: number,
  prevWeight: number,
  percentChange: number
): boolean => {
  return weight > prevWeight * (percentChange / 100) + prevWeight;
};

export const enteredWeightIsLessThanPrevWeight = (
  weight: number,
  prevWeight: number,
  percentChange: number
): boolean => {
  return weight < prevWeight - (percentChange / 100) * prevWeight;
};

//given a set of ids, checks to see if all are unique
export const checkUniqueIds = (ids: Array<string>): boolean => {
  let uniqueIds = [...new Set(ids)];
  return uniqueIds.length < ids.length ? false : true;
};

export const getlocations = (location:Array<any>): Array<Promise<any>> => {
  if (location.length == 0) {
    //alert('please set a location')
    return;
  }
  let promises: Array<Promise<any>> = [];
  location.forEach(loc => {
    let config: ConfigProps = {
      schemaName: "study",
      queryName: "demographicsCurLocation",
      columns: ["Id,location"],
      sort: "location",
      filterArray: [
        Filter.create(
          "location",
          loc.value,
          Filter.Types.CONTAINS
        )
      ]
    };
    promises.push(labkeyActionSelectWithPromise(config));
  });

  return promises;

};

export const setupJsonData = (values: DataRowsPerCommandType, QCState: string, taskId: string, reviewer: number, date: string, command: CommandType): Commands => {
  //for each grouped item (insert, update, delete), set up commands for each diff set.
  let commands: Array<ModifyRowsCommands> = [];
  Object.keys(values).forEach(function(key: CommandType,index: number) {
    let valuesToInsert = setupWeightValues(values[key], QCState, taskId);
    commands.push({
      schemaName: "study",
      queryName: "weight",
      command: key,
      rows: valuesToInsert
    })
  });

  let taskValue: Array<TaskValuesType> = setupTaskValues(taskId, date, reviewer, QCState);
  commands.push({
    schemaName: "ehr",
    queryName: "tasks",
    command: command,
    rows: taskValue
  });


  Object.keys(values).forEach(function(key: CommandType, index: number) {
    let valuesToInsert = setupRestraintValues(values[key], taskId);
    commands.push({
      schemaName: "study",
      queryName: "restraints",
      command: key,
      rows: valuesToInsert
    })
  });
  //TODO add trackids somewhere
  /*if (!checkUniqueIds(trackIds)) {
    //find which index is affected and return it to the correct area?
    alert("Cannot insert duplicate animals per weight form.");
    return;
  }*/
  return {
    commands: commands
  };
};

export const getQCStateByRowId = (id: number) => {};

export const generateUUID = () => {
  return Utils.generateUUID();
};

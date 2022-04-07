import {
    labkeyActionSelectWithPromise,
} from "./actions";
import {Filter, Utils} from "@labkey/api";

import { CommandType } from "@labkey/api/dist/labkey/query/Rows";
import {
    Commands,
    DataRowsPerCommandType,
    ModifyRowsCommands,
    TaskValuesType,
    WaterAmountValuesType
} from "../typings/main";

export const setupWaterAmountValues = (values: Array<any>, QCStateLabel: string, taskId: string): Array<WaterAmountValuesType> => {
    let valuesToInsert: Array<WaterAmountValuesType> = [];
    for (let value of values){
        valuesToInsert.push({
            Id: value.animalid.value,
            QCStateLabel: QCStateLabel,
            date: value.date.value,
            weight: value.weight.value,
            remark: value.remark.value,
            taskid: taskId,
            objectid: value.objectid.value
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
        title: "Enter Water Daily Amount",
        formType: "Enter Water Daily Amount",
        QCStateLabel: QCStateLabel
    }];
};

export const setupJsonData = (values: DataRowsPerCommandType, QCState: string, taskId: string, reviewer: number, date: string, command: CommandType): Commands => {
    //for each grouped item (insert, update, delete), set up commands for each diff set.
    let commands: Array<ModifyRowsCommands> = [];
    Object.keys(values).forEach(function(key: CommandType,index: number) {
        let valuesToInsert = setupWaterAmountValues(values[key], QCState, taskId);
        commands.push({
            schemaName: "study",
            queryName: "waterAmount",
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


    return {
        commands: commands
    };
};
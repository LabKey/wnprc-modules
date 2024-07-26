import { CommandType } from '@labkey/api/dist/labkey/query/Rows';
import {
    Commands,
    DataRowsPerCommandType,
    ModifyRowsCommands,
    TaskValuesType,
    WaterAmountValuesType
} from '../typings/main';
import { InsertValuesWithCommand, RowObj } from '../../weight/typings/main';

export const setupWaterAmountValues = (values: Object, QCStateLabel: string, taskId: string): Array<WaterAmountValuesType> => {
    let valuesToInsert: Array<WaterAmountValuesType> = [];


        valuesToInsert.push({

            Id: values["Id"],
            QCStateLabel: QCStateLabel,
            date: values["date"],
            project: values["project"],
            volume: values["volume"],
            provideFruit: values["provideFruit"],
            assignedTo: values["assignedTo"],
            frequency: values["frequency"],
            waterOrderObjectId: values["waterOrderObjectId"],
            recordSource: values["recordSource"],
            waterSource: values["waterSource"],
            taskid: taskId

           /* Id: value.animalid.value,
            QCStateLabel: QCStateLabel,
            date: value.date.value,

            taskid: taskId,*/

            //lsid: value.lsid.value || ""
        })

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

export const groupCommands = (values: Array<RowObj>): DataRowsPerCommandType => {

    return values.reduce((acc: object, item: RowObj) => {
        if (!acc[item.command.value.toString()]) {
            acc[item.command.value.toString()] = [];
        }

        acc[item.command.value.toString()].push(item);
        return acc;
    }, {} as InsertValuesWithCommand) as DataRowsPerCommandType;
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

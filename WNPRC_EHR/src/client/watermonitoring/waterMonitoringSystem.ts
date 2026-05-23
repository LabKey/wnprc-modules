/*
 * Copyright (c) 2022-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {setupTaskValues, setupWaterAmountValues} from "./query/pageHelpers";

declare const Ext4: any;
declare const LABKEY: any;

import * as $ from 'jquery';
import * as URI from 'urijs';

import {groupCommands, saveRowsDirect,setupJsonData,insertTaskCommand} from "../query/helpers";
import {RowObj, ContextProviderProps, WaterAmountValuesType,TaskValuesType} from "./typings/main";
import { ConfigProps } from "../typings/main";
import {ActionURL, Utils, Security, Filter} from "@labkey/api";
import { Command, CommandType } from "@labkey/api/dist/labkey/query/Rows";

//const waterMonitoringSystem: any

export const saveWaterAmount = (waterRecordCalendar, command, userid, returnObject) =>
{
    returnObject = {success:false, message:"null"};
    let taskCommand = null;
    Object.keys(waterRecordCalendar).forEach(function(key){

        if (key === "taskid"){
            //let dueDate = waterRecordCalendar["date"];
            let dueDate = '2022-04-12';
            let taskValue: Array<TaskValuesType> = setupTaskValues(waterRecordCalendar[key],dueDate,userid,"Scheduled")
            taskCommand = {
                schemaName: "ehr",
                queryName: "tasks",
                command: command,
                rows: taskValue
            };
            //taskIdCommand = insertTaskCommand(waterRecordCalendar[key],"Enter Water Daily Amount")
        }



    });
    //let itemsToInsert = groupCommands(waterRecordCalendar)

    let arrayOfCommands: Array<WaterAmountValuesType> = setupWaterAmountValues(waterRecordCalendar,"Scheduled",waterRecordCalendar["taskid"]);
    //arrayOfCommands.push(waterRecordCalendar);

    let jsonData = {
        commands:
            [
                {
                    schemaName: "study",
                    queryName: "waterAmount",
                    command: command,
                    rows: arrayOfCommands
                }
            ],

    };
    if (taskCommand !== null){
        jsonData.commands.push(taskCommand);
    }else {

        returnObject.success=false;
        returnObject.message="not able to generate task"
        return returnObject;
    }

    saveRowsDirect(jsonData).then( response => {
        returnObject.success=true;
        return {success: true,message:"success!"};

    }).catch(e => {
        console.log("typeScript error saving" + e);
        returnObject.success=false;
        returnObject.message=e.toString();
        return returnObject;
    })

}


/*export class waterMonitoringSystem
{
    public  saveWaterAmount (waterRecordCalendar,command){
        let itemsToInsert = groupCommands(waterRecordCalendar)
        let jsonData = setupJsonData(itemsToInsert,"study","waterAmount");

        saveRowsDirect(jsonData).then(()=>{
            this.changeActionToUpdate(waterRecordCalendar)

        })
    }

    private changeActionToUpdate(waterRecordData){
        let copyformdata : Array<RowObj> = [...waterRecordData];
        copyformdata.forEach(item => {
            if (item["command"]["value"] != "delete") {
                item["command"]["value"] = "update";
            }
        });
        setFormDataInAppContext(copyformdata);

    }

}*/


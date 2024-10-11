require("ehr/triggers").initScript(this);
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
let LABKEY = require("labkey");
let triggerHelper = new org.labkey.wnprc_ehr.TriggerScriptHelper.create(LABKEY.Security.currentUser.id, LABKEY.Security.currentContainer.id);
let allowUsersMap = {};

function onInit(event, helper){
    helper.setScriptOptions({
        allowFutureDates: true,
        allowDatesInDistantPast: true
    });
    LABKEY.Query.selectRows({
        requiredVersion: 9.1,
        schemaName: 'wnprc',
        queryName: 'watermonitoring_access',
        columns:['alloweduser/UserId,project'],
        scope: this,
        success: function(results) {
            var rows = results.rows;
            for(var i=0; i<rows.length; i++){
                var row = rows[i];
                if (allowUsersMap[row["alloweduser/UserId"]["value"]] === undefined){
                    let projectArray = [row["project"]["value"]];
                    allowUsersMap[row["alloweduser/UserId"]["value"]]=projectArray;
                }else{
                    var tempItem = allowUsersMap[row["alloweduser/UserId"]["value"]];
                    tempItem.push(row["project"]["value"]);
                    allowUsersMap[row["alloweduser/UserId"]["value"]]=tempItem;
                }
            }
        },
        failure: function (error) {
            console.log("Error getting data from wnprc.watermonitoring_access while uploading water orders data: " + error);
        }
    });
}


function onUpsert(helper, scriptErrors, row, oldRow){

    if (row.Id){
        EHR.Server.Utils.findDemographics({
            participant: row.Id,
            helper: helper,
            scope: this,
            callback: function(data){
                if(data){
                    if(!row.project){
                        EHR.Server.Utils.addError(scriptErrors, 'project', 'Must enter a project for all center animals.', 'WARN');

                    }
                }
            }
        });
        var animalRestricted = {};
        animalRestricted = WNPRC.Utils.getJavaHelper().checkIfAnimalInCondition(row.Id, row.date);
        //console.log (animalRestricted);
        if (!animalRestricted && !row.skipWaterRegulationCheck){
            EHR.Server.Utils.addError(scriptErrors,'Id', 'Animal not assigned to water restriction protocol or is already in ' + row.waterSource + ' condition.', 'ERROR');
        }



    }


    var today = new Date();
    today.setHours(0,0,0,0);

    var rowDate = new Date(row.date);
    rowDate.setHours(0,0,0,0);
    EHR.Server.Utils.removeTimeFromDate(row,scriptErrors,"date");


    //TODO: allow updates of existing records.
    if(oldRow && !(rowDate.getTime() >= today.getTime()) && (row.objectid != oldRow.objectid)){
        EHR.Server.Utils.addError(scriptErrors, 'date', 'Only Dates in the Future Allow', 'ERROR');
    }

    var endDate = new Date(row.enddate);
    endDate.setHours(0,0,0,0);

    //This does not get checked when the dataset if updated, only when using Ext4 form
    if (rowDate.getTime() > endDate.getTime()){
        EHR.Server.Utils.addError(scriptErrors,'endDate', 'EndDate cannot be before StartDate', 'ERROR');
    }

    if (!row.frequency && row.waterSource == 'regulated'){
        EHR.Server.Utils.addError(scriptErrors, 'frequency', 'Frequency is required when entering regulated water orders.', 'ERROR');
    }
    if (!row.volume && row.waterSource == 'regulated'){
        //console.log ("water vol "+ row.volume);
        EHR.Server.Utils.addError(scriptErrors, 'volume', 'Volume is required when entering regulated water orders.', 'ERROR');
    }

    if (!row.assignedTo && row.waterSource == 'regulated'){
        EHR.Server.Utils.addError(scriptErrors, 'assignedTo', 'Assigned To is required when entering regulated water orders.', 'ERROR');
    }

    if (!row.waterSource){
        EHR.Server.Utils.addError(scriptErrors, 'waterSource', 'Water Source is required when entering new orders.', 'ERROR');
    }

    //console.log ("value of ObjectId "+oldRow.objectid + " Value of new objectId "+ row.objectid);
   //console.log ('skipWaterRegulation '+ row.skipWaterRegulationCheck);
   // if (oldRow && row.date && row.Id && row.frequency && (oldRow.objectid != row.objectid)) {
    if (row.project && row.objectid && row.Id && row.date && row.frequency && row.assignedTo && row.waterSource != 'lixit' && !row.skipWaterRegulationCheck) {
        console.log("close record "+ row.closingRecord);
        let jsonArray = WNPRC.Utils.getJavaHelper().checkWaterRegulation(row.id, row.date, row.enddate ? row.enddate : null, row.frequency, row.waterSource, row.objectid, row.project, this.extraContext);
        if (jsonArray != null) {
            for (var i = 0; i < jsonArray.length; i++) {
                var errorObject = jsonArray[i];
                EHR.Server.Utils.addError(scriptErrors, errorObject.field, errorObject.message, errorObject.severity);
            }
        }
        row.date = rowDate;
    }

    if (row.Id && row.date && row.enddate && row.project && row.objectid &&  row.closingRecord){
        let jsonArray = WNPRC.Utils.getJavaHelper().closeWaterOrder(row.id, row.date, row.enddate, row.project, row.objectid, row.closingRecord);
        if (jsonArray != null) {
            for (var i = 0; i < jsonArray.length; i++) {
                var errorObject = jsonArray[i];
                EHR.Server.Utils.addError(scriptErrors, errorObject.field, errorObject.message, errorObject.severity);
            }
        }
    }

    //if (oldRow && oldRow.waterSource == 'regulated' && row.waterSource == 'lixit'){
    //TODO: by pass water regulation to change water order to lixit and also chnage the water regulated animals data
    if ( row.waterSource == 'lixit' && !row.skipWaterRegulationCheck && !oldRow){

        let jsonArray = WNPRC.Utils.getJavaHelper().changeWaterScheduled(row.id,row.date,row.waterSource, row.project, row.objectid,row.closingRecord,this.extraContext);
        let jsonExtraContext = this.extraContext.extraContextArray;

        if (jsonArray != null){
            for (var i=0; i < jsonArray.length; i++){
                let errorObject = JSON.parse(jsonArray[i]);
                EHR.Server.Utils.addError(scriptErrors,errorObject.field, errorObject.message, errorObject.severity);

            }
            if (jsonExtraContext != null){
                for (var i = 0; i < jsonExtraContext.length; i++){
                    let extraContextObject = jsonExtraContext[i];
                    let date =  extraContextObject.date;
                    let dateOnly = new Date(date.getTime());
                    dateOnly = dateOnly.getFullYear()+ "-" +dateOnly.getMonth()+ "-" + dateOnly.getDate();
                    let infoMessage = "Water Order for "+ row.Id + " started on " + dateOnly + " with frequency of " + extraContextObject.frequency + " and volume of " + extraContextObject.volume + "ml will close.";
                    EHR.Server.Utils.addError(scriptErrors,"waterSource",infoMessage,"INFO")

                }

            }

        }
    }

}

function onUpdate(helper, scriptErrors, row, oldRow){

    let waterOrdersAdmin = false;

    if (row && row.project){
        let currentUser = LABKEY.Security.currentUser.id;
        let allowProjects = allowUsersMap[currentUser];
        if (allowProjects){
            allowProjects.forEach(function (project){
                if (row.project === project){
                    waterOrdersAdmin = true;
                }
            })
        }

        if (!triggerHelper.isDataAdmin() && !waterOrdersAdmin ){
            EHR.Server.Utils.addError(scriptErrors,'project','User does not have permission to edit water order under this project.','ERROR');
            console.error("Water System error, user: "+ currentUser + " trying to modify water order for project: "+ row.project +" and they do not have permissions");

        }
    }
    console.log ("value of triggerHelper admin "+ triggerHelper.isDataAdmin());

    if (!triggerHelper.isDataAdmin()){
        let errorField = null;
        if(oldRow){
         
            var tempKeys = Object.keys(oldRow);
            for (var i = 0; i <= tempKeys.length; i++){
                var key = tempKeys[i];         
                if (key !== 'enddate' && oldRow[key] != row[key]){
                    console.log('field checked '+ key)
                    switch (key){
                        case "id":
                            addErrorMessage(key, scriptErrors);
                            break;
                        case "date":
                            var newDate = new Date(EHR.Server.Utils.normalizeDate(row[key]));
                            var oldDate = new Date(EHR.Server.Utils.normalizeDate(oldRow[key]));         
                            if (newDate.getTime() !== oldDate.getTime()){                                
                                addErrorMessage(key, scriptErrors);
                            }
                            break;
                        case "volume":
                            addErrorMessage(key, scriptErrors);
                            break;
                        case "frequency":
                            addErrorMessage(key, scriptErrors);
                            break;
                        case "assignedTo":
                            addErrorMessage(key, scriptErrors);
                            break;
                        case "waterSource":
                            addErrorMessage(key, scriptErrors);
                            break;
                        case "provideFruit":
                            addErrorMessage(key, scriptErrors);
                            break;
                        case "project":
                            addErrorMessage(key, scriptErrors);
                            break;
                    }
                }
            }            
        }


        if (row.id !== oldRow.id || row.date !== oldRow.date || row.volume !== oldRow.volume)
        {
            //EHR.Server.Utils.addError(scriptErrors,'date');

        }

    }
}

function addErrorMessage(key,scriptErrors){
    EHR.Server.Utils.addError(scriptErrors, key, 'User does not have permission to modify this field.', 'ERROR');
}

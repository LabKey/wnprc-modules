require("ehr/triggers").initScript(this);
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

function onInit(event, helper){
    helper.setScriptOptions({
        allowFutureDates: true
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
        var animalRestricted = false;
        animalRestricted = WNPRC.Utils.getJavaHelper().checkIfAnimalIsRestricted(row.Id, row.date);

        if (!animalRestricted){
            EHR.Server.Utils.addError(scriptErrors,'Id', 'Animal not assigned to water restriction protocol or condition as Lixit/Ad lib', 'ERROR');
        }



    }

    var today = new Date();
    console.log("Value of date " + row.date);
    //console.log("Value of start date " + row.startdate);
    today.setHours(0,0,0,0);

    var rowDate = new Date(row.date);
    rowDate.setHours(0,0,0,0);

    console.log("Value of date " + rowDate + " "+ rowDate.getTime());
    //console.log("Value of start date " + row.startdate);
    console.log("Value of today "+ today+ " "+ today.getTime());


    //TODO: allow updates of existing records.
    if(!(rowDate.getTime() >= today.getTime()) && (oldRow.objectid != row.objectid)){
        EHR.Server.Utils.addError(scriptErrors, 'date', 'Only Dates in the Future Allow', 'ERROR');
    }

    var endDate = new Date(row.enddate);
    endDate.setHours(0,0,0,0);

    //This does not get checked when the dataset if updated, only when using Ext4 form
    if (rowDate.getTime() > endDate.getTime()){
        EHR.Server.Utils.addError(scriptErrors,'endDate', 'EndDate cannot be before StartDate', 'ERROR');
    }

    if (!row.frequency){
        EHR.Server.Utils.addError(scriptErrors, 'frequency', 'Frequency is required when entering new orders.', 'ERROR');
    }

    if (!row.waterSource){
        EHR.Server.Utils.addError(scriptErrors, 'waterSource', 'Water Source is required when entering new orders.', 'ERROR');
    }

    //console.log ("value of ObjectId "+oldRow.objectid + " Value of new objectId "+ row.objectid);

   // if (oldRow && row.date && row.Id && row.frequency && (oldRow.objectid != row.objectid)) {
    if (row.objectid && row.Id && row.date && row.frequency && row.assignedTo) {
        console.log('value of row: '+row + ' '+ row.frequency);
        let jsonArray = WNPRC.Utils.getJavaHelper().checkWaterRegulation(row.id, row.date, row.enddate ? row.enddate : null, row.frequency, row.objectid, this.extraContext);
        if (jsonArray != null) {
            for (var i = 0; i < jsonArray.length; i++) {
                var errorObject = JSON.parse(jsonArray[i]);
                console.log(i + " " + errorObject.message);
                EHR.Server.Utils.addError(scriptErrors, errorObject.field, errorObject.message, errorObject.severity);
            }
        }
    }

    if (oldRow && oldRow.waterSource == 'regulated' && row.waterSource == 'lixit'){
        let changeMessage = WNPRC.Utils.getJavaHelper().changeWaterScheduled(row.id,row.date,row.waterSource);
        if (changeMessage == 'Error'){
            EHR.Server.Utils.addError(scriptErrors,'id', 'Problems changing water scheduled animals', 'WARN');
        }
    }



}
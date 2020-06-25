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

    //TODO: remove triggers.js already checks this data
    if (rowDate.getTime() > endDate.getTime()){
        EHR.Server.Utils.addError(scriptErrors,'endDate', 'EndDate cannot be before StartDate', 'ERROR');
    }

    //console.log ("value of ObjectId "+oldRow.objectid + " Value of new objectId "+ row.objectid);

   // if (oldRow && row.date && row.Id && row.frequency && (oldRow.objectid != row.objectid)) {
    if (row.objectid) {
        //
        let jsonArray = WNPRC.Utils.getJavaHelper().checkWaterRegulation(row.id, row.date, row.enddate ? row.enddate : null, row.frequency, row.objectid);
        if (jsonArray != null) {
            for (var i = 0; i < jsonArray.length; i++) {
                var errorObject = JSON.parse(jsonArray[i]);
                console.log(i + " " + errorObject.message);
                EHR.Server.Utils.addError(scriptErrors, errorObject.field, errorObject.message, errorObject.severity);
            }
        }
    }



}
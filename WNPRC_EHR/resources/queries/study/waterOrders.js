require("ehr/triggers").initScript(this);
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

function onInit(event, helper){
    helper.setScriptOptions({
        allowFutureDates: true
    });
}

function onUpsert(helper, scriptErrors, row, oldRow){
    console.log("print oldRow "+ oldRow);

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
    //console.log("Value of date " + row.date);
    //console.log("Value of start date " + row.startdate);
    today.setHours(0,0,0,0);

    var rowDate = new Date(row.date);
    rowDate.setHours(0,0,0,0);
    EHR.Server.Utils.removeTimeFromDate(row,scriptErrors,"date");

    //console.log("Value of date " + rowDate + " "+ rowDate.getTime());
    //console.log("Value of start date " + row.startdate);
    //console.log("Value of today "+ today+ " "+ today.getTime());


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
        console.log('value of row: frequency ' + row.frequency + ' value of waterSource ' + row.waterSource);
        let jsonArray = WNPRC.Utils.getJavaHelper().checkWaterRegulation(row.id, row.date, row.enddate ? row.enddate : null, row.frequency, row.waterSource, row.objectid, row.project, this.extraContext);
        if (jsonArray != null) {
            for (var i = 0; i < jsonArray.length; i++) {
                var errorObject = JSON.parse(jsonArray[i]);
                EHR.Server.Utils.addError(scriptErrors, errorObject.field, errorObject.message, errorObject.severity);
            }
        }
        row.date = rowDate;
    }

    //if (oldRow && oldRow.waterSource == 'regulated' && row.waterSource == 'lixit'){
    //TODO: by pass water regulation to change water order to lixit and also chnage the water regulated animals data
    if ( row.waterSource == 'lixit' && !row.skipWaterRegulationCheck && !oldRow){

        let jsonArray = WNPRC.Utils.getJavaHelper().changeWaterScheduled(row.id,row.date,row.waterSource, row.project, row.objectid,this.extraContext);
        let jsonExtraContext = this.extraContext.extraContextArray;

        if (jsonArray != null){
            for (var i=0; i < jsonArray.length; i++){
                let errorObject = JSON.parse(jsonArray[i]);
                EHR.Server.Utils.addError(scriptErrors,errorObject.field, errorObject.message, errorObject.severity);

            }
            console.log(" Printing Extra Context" + jsonExtraContext);
            if (jsonExtraContext != null){
                for (var i = 0; i < jsonExtraContext.length; i++){
                    let extraContextObject = jsonExtraContext[i];
                    let date =  extraContextObject.date;
                    let dateOnly = new Date(date.getTime());
                    dateOnly = dateOnly.getFullYear()+ "-" +dateOnly.getMonth()+ "-" + dateOnly.getDate();
                    let infoMessage = "Water Order for "+ row.Id + " started on " + dateOnly + " with frequency of " + extraContextObject.frequency + " and volume of " + extraContextObject.volume + "ml will close.";
                    //console.log(infoMessage);
                    EHR.Server.Utils.addError(scriptErrors,"waterSource",infoMessage,"INFO")

                }

            }

        }
    }



}

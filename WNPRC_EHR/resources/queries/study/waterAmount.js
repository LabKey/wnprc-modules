require("ehr/triggers").initScript(this);
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

function onInit(event, helper){
    helper.setScriptOptions({
        allowFutureDates: true
    });
}

function onUpsert(helper, scriptErrors, row, oldRow) {
    console.log (" recordSource value " +row.recordSource);
    if (row.recordSource=="LabWaterForm"){
        /*var today = new Date();
        today.setHours(0,0,0,0);
        var rowDate = new Date (row.date);
        //rowDate.setHours(0,0,0,0);
        if (rowDate.getTime() !== today.getTime()){
            EHR.Server.Utils.addError (scriptErrors,'date','Additional water in this form can only be requested for the same date', 'ERROR');
        }*/
        //row.date = rowDate;
        console.log("value of qcstate waterAmount " + row.qcstate);
        if (!row.skipWaterRegulationCheck){
            row.qcstate = 10;
            row.QCStateLabel = 'Scheduled'
            console.log("value of qcstate waterAmount after setting 10 " + row.qcstate);

        }


        console.log ("value of assignedTo "+ row.assignedTo)
        if (row.assignedTo == "animalcare" && row.volume && !row.skipWaterRegulationCheck){
            let errorMessage = WNPRC.Utils.getJavaHelper().checkUploadTime(row.id,row.date,row.recordSource,row.assignedTo, 'waterAmount');
            if (errorMessage != null){
                EHR.Server.Utils.addError(scriptErrors,'assignedTo',errorMessage,'INFO');
            }
        }
        if (row.volume && row.waterSource == "regulated" && !row.skipWaterRegulationCheck){
            let jsonArray = WNPRC.Utils.getJavaHelper().checkWaterSchedule(row.id,row.date,row.objectid,row.volume);
            if (jsonArray != null){
                for (var i = 0; i < jsonArray.length; i++ ){
                    let errorObject = JSON.parse(jsonArray[i]);
                    EHR.Server.Utils.addError(scriptErrors,errorObject.field, errorObject.message,errorObject.severity);

                }
            }
            
        }

    }

}
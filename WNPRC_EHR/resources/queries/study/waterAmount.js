require("ehr/triggers").initScript(this);
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

function onInit(event, helper){
    helper.setScriptOptions({
        allowFutureDates: false
    });
}

function onUpsert(helper, scriptErrors, row, oldRow) {
    console.log (" recordSource value " +row.recordSource);
    if (row.recordSource=="LabWaterForm"){
        var today = new Date();
        today.setHours(0,0,0,0);
        var rowDate = new Date (row.date);
        rowDate.setHours(0,0,0,0);
        if (rowDate.getTime() !== today.getTime()){
            EHR.Server.Utils.addError (scriptErrors,'date','Additional water in this form can only be requested for the same date', 'ERROR');
        }
        row.date = rowDate;
        console.log("value of qcstate waterAmount " + row.qcstate);
        row.qcstate = 10;
        row.QCStateLabel = 'Scheduled'
        console.log("value of qcstate waterAmount after setting 10 " + row.qcstate);

        console.log ("value of assignedTo "+ row.assignedTo)
        if (row.assignedTo == "animalcare"){
            let map = helper.getProperty('waterInTransaction');
            let waters = [];
            if (map && map[row.id]) {
                 waters = map[row.id];
            }

            console.log ("got into if");
           // WNPRC.Utils.getJavaHelper().checkScheduledWaterTask(waters);

        }

    }

}
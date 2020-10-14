require("ehr/triggers").initScript(this);
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

function onInit(event, helper){
    helper.setScriptOptions({
        allowFutureDates: false
    });
}

function onUpsert(helper, scriptErrors, row, oldRow) {
    if (row.recordSource=="LabWaterForm"){
        var today = new Date();
        today.setHours(0,0,0,0);
        var rowDate = new Date (row.date);
        rowDate.setHours(0,0,0,0);
        if (rowDate.getTime() !== today.getTime()){
            EHR.Server.Utils.addError (scriptErrors,'date','Additional water in this form can only be requested for the same date', 'ERROR');
            
            
        }
    }

}
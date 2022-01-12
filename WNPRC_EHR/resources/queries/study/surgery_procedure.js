var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

require("ehr/triggers").initScript(this);

function onInit(event, helper){
    helper.setScriptOptions({
        allowAnyId: true,
        skipIdFormatCheck: true,
        allowFutureDates: true
    });
}

function onUpsert(helper, scriptErrors, row, oldRow) {
    if (row.procedureUnit === "spi") {
        //do nothing
    } else if (row.procedureUnit === "vet") {
        //add lots of required fields for surgeries
        if (!row.startTableTime) {
            EHR.Server.Utils.addError(scriptErrors, "startTableTime", "Start Table Time is required", "ERROR");
        }
        if (!row.project) {
            EHR.Server.Utils.addError(scriptErrors, "project", "Project is required", "ERROR");
        }
        if (!row.account) {
            EHR.Server.Utils.addError(scriptErrors, "account", "Grant is required", "ERROR");
        }
        if (!row.surgeon) {
            EHR.Server.Utils.addError(scriptErrors, "surgeon", "Surgeon is required", "ERROR");
        }
        if (!row.vetNeededReason) {
            EHR.Server.Utils.addError(scriptErrors, "vetNeededReason", "Reason Vet is Needed is required", "ERROR");
        }
        if (!row.equipment) {
            EHR.Server.Utils.addError(scriptErrors, "equipment", "Special Equipment/Supplies Requested is required", "ERROR");
        }
        if (!row.drugsLab) {
            EHR.Server.Utils.addError(scriptErrors, "drugsLab", "Drugs Lab Will Provide is required", "ERROR");
        }
        if (!row.drugsSurgery) {
            EHR.Server.Utils.addError(scriptErrors, "drugsSurgery", "Drugs Surgery Staff Requested to Provide is required", "ERROR");
        }

        if (!!row.startTableTime) {
            console.log(row.startTableTime);
            if (row.startTableTime.hours === 0 && row.startTableTime.minutes === 0) {
                EHR.Server.Utils.addError(scriptErrors, "startTableTime", "You must select a 'Start Table Time'", "ERROR");
            }
        }
    }

    if (!!row.date && !!row.startTableTime) {
        if (row.date.year !== row.startTableTime.year || row.date.month !== row.startTableTime.month || row.date.date !== row.startTableTime.date) {
            EHR.Server.Utils.addError(scriptErrors, "startTableTime", "'Start Table Time' should almost always be on the same date as 'Surgery/Procedure Date'. Are you sure this is correct?", "WARN");
        }
    }
}

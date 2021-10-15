var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
require("ehr/triggers").initScript(this);

function onInit(event, helper){
    if (event === "update") {
        helper.setScriptOptions({
            allowDatesInDistantPast: true
        });
    }
}

function onInsert(helper, scriptErrors, row, oldRow) {
}

function onUpdate(helper, scriptErrors, row, oldRow) {
}

function onUpsert(helper, scriptErrors, row, oldRow) {
    if (row.restraintType == 'Other'){
        if(!row.remarks){
            EHR.Server.Utils.addError(scriptErrors, 'remarks', 'Remarks are required when Other is selected from restraint type')
        }
    }
}

function setDescription(row, helper){
    let description = [];

    description.push("Restraint Type: " + row.restraintType);
    if (row.remarks) {
        description.push("Remarks: " + row.remarks);
    }

    return description;
}
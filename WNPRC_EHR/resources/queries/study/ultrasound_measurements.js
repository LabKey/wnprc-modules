var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
require("ehr/triggers").initScript(this);

function onInit(event, helper){
    if (event === "update") {
        helper.setScriptOptions({
            allowDatesInDistantPast: true
        });
    }
}

function onInsert(helper, scriptErrors, row, oldRow){
}

function onUpdate(helper, scriptErrors, row, oldRow){
}

function onUpdate(helper, scriptErrors, row, oldRow){
}
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
require("ehr/triggers").initScript(this);

function onInsert(helper, scriptErrors, row, oldRow){
    console.log('onInsert');
}

function onUpdate(helper, scriptErrors, row, oldRow){
    console.log('onUpdate');
    //WNPRC.Utils.getJavaHelper().updateUltrasoundMeasurements(row.taskid);
}

function onUpdate(helper, scriptErrors, row, oldRow){
    console.log('onUpsert');
}
var console = require("console");
var LABKEY = require("labkey");
require("ehr/triggers").initScript(this);
EHR.Server.Utils = require("ehr/utils").EHR.Server.Utils;

var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

//FYI: Get's called on every single key press!
function onInit(event, helper){
    console.log('we are here, we are here, we are here!');
    // helper.registerRowProcessor(function(helper, row) {
    //     if (!row)
    //         return;
    //
    //     if (!row.requestId || !row.protocol)
    //     {
    //         return;
    //     }
    // })

}
//
function onBeforeInsert(row, errors){
    // if (this.extraContext.targetQC) {
    //     row.QCStateLabel = this.extraContext.targetQC;
    // }
    console.log('beforeInsert');
    //EHR.Server.Utils.onFailure;
}

function onAfterInsert(row, errors) {
    console.log('afterInsert');
    WNPRC.U
}

function onBeforeUpdate(row, errors) {
    console.log('beforeUpdate');
}

function onAfterUpdate(row, errors) {
    console.log('afterUpdate');
}

function onInsert(row, errors) {
    console.log('insert');
}

function onUpdate(row, errors) {
    console.log('update');
}

function onComplete(event,errors, helper) {
    console.log('onComplete');
}
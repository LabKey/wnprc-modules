var console = require("console");
require("ehr/triggers").initScript(this);
require("labkey");

//FYI: Get's called on every single key press!
function onInit(event, helper){
    // console.log('onInit');
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
// function onBeforeInsert(row, errors){
//     // if (this.extraContext.targetQC) {
//     //     row.QCStateLabel = this.extraContext.targetQC;
//     // }
//     console.log('onBeforeInsert');
//     console.log('row: ' + JSON.stringify(row));
//     //EHR.Server.Utils.onFailure;
// }
//
// function onAfterInsert(row, errors) {
//     console.log('onAfterInsert');
//     console.log('row: ' + JSON.stringify(row));
// }
//
// function onBeforeUpdate(row, errors) {
//     console.log('onBeforeUpdate');
//     console.log('row: ' + JSON.stringify(row));
// }
//
// function onAfterUpdate(row, errors) {
//     console.log('onAfterUpdate');
//     console.log('row: ' + JSON.stringify(row));
// }
//
// function onInsert(row, errors) {
//     console.log('onInsert');
//     console.log('row: ' + JSON.stringify(row));
// }

function onInsert(helper, scriptErrors, row, oldRow) {

}

function onUpsert(helper, scriptErrors, row, oldRow){

}

// function onUpdate(row, errors) {
//     console.log('onUpdate');
//     console.log('row: ' + JSON.stringify(row));
// }
//
// function onComplete(event,errors, helper) {
//     console.log('onComplete');
// }
require("ehr/triggers").initScript(this);

function onInit(event, helper){
    helper.setScriptOptions({
        allowAnyId: true,
        allowDeadIds: true,
        skipIdFormatCheck: true,
        allowDatesInDistantPast: true
    });
}
function onInsert(helper, scriptErrors, row, oldRow){


    if (row && row.Id){
        row.protected = !!row.protected;
        row.rejected = !!row.rejected;
        //row.QCState = EHR.Server.Security.getQCStateByLabel('Completed').RowId;
        row.QCStateLabel = EHR.Server.Security.getQCStateByLabel('Completed').Label;
    }
}
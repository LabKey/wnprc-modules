require("ehr/triggers").initScript(this);
require("labkey");

function onUpsert(helper, scriptErrors, row, oldRow){
    console.log('value on row.restraints '+ row.remarks);
    if (row.restraintType == 'Other'){
        if(!row.remarks){
            EHR.Server.Utils.addError(scriptErrors, 'remarks', 'Remarks are required when Other is selected from restraint type')
        }
        


    }

}
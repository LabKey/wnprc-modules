require("ehr/triggers").initScript(this);

function onInsert(helper, scriptErrors, row, oldRow){


    if (row && row.Id){
        row.protected = !!row.protected;
    }
}
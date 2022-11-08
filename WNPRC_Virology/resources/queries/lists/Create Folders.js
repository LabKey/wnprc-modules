var LABKEY = require("labkey");
var console = require("console");
var helper = org.labkey.wnprc_virology.utils.TriggerScriptHelper.create(LABKEY.Security.currentUser.id, LABKEY.Security.currentContainer.id);

function afterInsert(row) {
    console.log(row.folderName);
    //helper.setupChildFolder(row.folderName);

}

function onUpdate(row, oldRow) {

    //TODO handle updates
    //update the mappings entries if the account changes.
    //do we want to allow folder name changes?

    if (row.accounts != oldRow.accounts)
    {

    }
}

var LABKEY = require("labkey");
var console = require("console");

function afterInsert(row) {
    console.log(row.folderName);


    LABKEY.Ajax.request({
        url: LABKEY.ActionURL.buildURL('core', 'getModuleProperties', null),
        method: 'POST',
        jsonData: {moduleName: 'WNPRC_Virology', includePropertyValues: true},
        success: LABKEY.Utils.getCallbackWrapper(function (response) {
            console.log(response["values"]["RSEHRPortalContainerPath"]["effectiveValue"])
            var containerConfig = {
                name: row.folderName,
                containerPath: response["values"]["RSEHRPortalContainerPath"]["effectiveValue"],
                folderType: 'WNPRC_Virology',
                success: function () {
                    // we may want a separate list that contains the account mappings

                },
                failure: function () {

                },
            }
            LABKEY.Security.createContainer(containerConfig)

        }, this),
    });

}

function onUpdate(row, oldRow) {

    //update the mappings entries if the account changes.
    //do we want to allow folder name changes?

    if (row.accounts != oldRow.accounts)
    {

    }
}

var LABKEY = require("labkey");

var rowids = [];
var hostName =  'https://' + LABKEY.serverName;
var emailParams = {};
var insertedOnce = false;
var helper = org.labkey.wnprc_virology.utils.TriggerScriptHelper.create(LABKEY.Security.currentUser.id, LABKEY.Security.currentContainer.id);

var grantObj = {};
var statuses = {};
var zikaQCState = "08-complete-email-Zika_portal";
var additionalChecksForStatuses = ["09-complete-email-RSEHR", "08-complete-email-Zika_portal"];

function init(event, errors) {

    //these select rows are always synchronous, so we can be sure we have the accounts before our beforeInsert is run
    LABKEY.Query.selectRows({
        schemaName: 'lists',
        queryName: 'status',
        columns: ['Key', 'Status'],
        success: function (res) {
            let result = res.rows;
            for (let k = 0; k < result.length; k++){
                statuses[result[k].Key] = result[k].Status;
            }
        }
    })

    LABKEY.Query.selectRows({
        schemaName: 'ehr_billing_linked',
        queryName: 'aliases',
        columns: ["rowid", "alias"],
        success: function (data) {
            let grantsArr = data.rows;
            for (let j = 0; j < grantsArr.length; j++){
                grantObj[grantsArr[j].alias] = grantsArr[j].rowid;
            }
        }
    })

}

function beforeInsert(row, errors) {
    const errPreface = 'Error during import: ';
    if (typeof row.Funding_string == "number") {
        if (!!grantObj[row.Funding_string]){
            errors.Funding_string = errPreface + 'Funding string with rowid ' + row.Funding_string + ' not found in grant accounts table.';
            return;
        }
    } else if (typeof row.Funding_string == "string") {
        row.Funding_string = row.Funding_string.toLowerCase().trim();
        if (typeof grantObj[row.Funding_string] == 'undefined'){
            errors.Funding_string = errPreface + 'Funding string ' + row.Funding_string + ' not found in grant accounts table.'
            return;
        } else {
            row.Funding_string = grantObj[row.Funding_string];
        }
    } else {
        errors.Funding_string = errPreface + 'Incorrect type for funding string';
        return;
    }
}

function checkQC(qc) {
    for (var k = 0; k < additionalChecksForStatuses.length; k++){
        if (additionalChecksForStatuses[k] == statuses[qc]){
            return true;
        }
    }
    return false;
}

function beforeUpdate(row, oldRow, errors){
    //we check for this as well in DatasetButtons.js but it's good to check again here on the server
    // and also important for regular form updates
    if ((!row.experimentNumber ||
                    !row.positive_control ||
                    !row.vl_positive_control ||
                    !row.avg_vl_positive_control ||
                    !row.efficiency)
            && checkQC(row.Status)
            ) {
        errors.experimentNumber = 'Cannot complete a record without an experiment number, positive control or efficiency value';
        return;
    }

    if (statuses[row.Status] == zikaQCState && !row.emails){
        errors.emails = 'Notify column required for status = ' + zikaQCState;
        return;
    }
}

function afterUpdate(row, oldRow, errors){
    rowids.push(row.Key);
    if (insertedOnce) {
        return;
    }
    emailParams = {
        status: row.Status,
        hostName: hostName,
        experimentNumber: row.experimentNumber,
        positive_control: row.positive_control,
        vl_positive_control: row.vl_positive_control,
        avg_vl_positive_control: row.avg_vl_positive_control,
        efficiency: row.efficiency
    };
    insertedOnce = true;
}

function complete() {
    helper.sendViralLoadQueueNotification(rowids, emailParams);
}

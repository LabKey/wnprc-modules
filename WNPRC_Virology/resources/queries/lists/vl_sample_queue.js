var LABKEY = require("labkey");

var rowids = [];
var hostName =  'https://' + LABKEY.serverName;
var completedStatus = 8;
var emailParams = {};
var insertedOnce = false;
var helper = org.labkey.wnprc_virology.utils.TriggerScriptHelper.create(LABKEY.Security.currentUser.id, LABKEY.Security.currentContainer.id);

function beforeUpdate(row){
    if ((typeof row.experimentNumber == 'undefined' ||
                    typeof row.positive_control == 'undefined' ||
                    typeof row.vl_positive_control == 'undefined' ||
                    typeof row.avg_vl_positive_control == 'undefined' ||
                    typeof row.efficiency == 'undefined')
            && row.Status == completedStatus) {
        throw 'Cannot complete a record without an experiment number, positive control or efficiency value';
    }
}

function afterUpdate(row, oldRow, errors){
    if (row.Status != completedStatus){
        return;
    }
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

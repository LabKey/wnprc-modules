var console = require("console");
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
var LABKEY = require("labkey");

var rowids = [];
var hostName =  'https://' + LABKEY.serverName;
var status = 0;
var experimentNumber = 0;
var completedStatus = 8;

function beforeUpdate(row){
   if (typeof row.experimentNumber == 'undefined' && row.Status == completedStatus){
        throw 'Cannot complete a record without an experiment number';
    }
}

function afterUpdate(row, oldRow, errors){
    if (typeof row.experimentNumber != 'undefined') {
        experimentNumber = row.experimentNumber
    }
    status = row.Status;
    rowids.push(row.Key);
}

function complete() {
    WNPRC.Utils.getJavaHelper().sendViralLoadQueueNotification(rowids, status, hostName, experimentNumber);
}

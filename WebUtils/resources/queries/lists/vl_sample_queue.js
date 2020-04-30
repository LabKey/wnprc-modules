var console = require("console");
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
var LABKEY = require("labkey");

var trackids = [];
var hostName =  'https://' + LABKEY.serverName;
var status;

function afterUpdate(row, oldRow, errors){
    status = row.Status;
    trackids.push(row.Key);
}

function complete() {
    WNPRC.Utils.getJavaHelper().sendViralLoadQueueNotification(trackids, status, hostName);
}

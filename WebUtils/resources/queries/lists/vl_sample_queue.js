var console = require("console");
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
var LABKEY = require("labkey");

var trackids = [];
var hostName =  'https://' + LABKEY.serverName;
var status;

function beforeUpdate(row){
    console.log(row.test)
    console.log(row.test)
    //should check if qc status is complete too before enforcing rule, if submitters wnat to update record
    if (typeof row.test == 'undefined'){
        throw 'error!';
    }
}

function afterUpdate(row, oldRow, errors){
    status = row.Status;
    trackids.push(row.Key);
}

function complete() {
    //WNPRC.Utils.getJavaHelper().sendViralLoadQueueNotification(trackids, status, hostName);
}

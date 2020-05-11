var console = require("console");
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
var LABKEY = require("labkey");

var trackids = [];
var hostName =  'https://' + LABKEY.serverName;
var status;
var num = 0;

function beforeUpdate(row){
    //should check if qc status is complete too before enforcing rule, if submitters wnat to update record
   /* if (typeof row.test == 'undefined'){
        throw 'error!';
    }*/
}

function afterUpdate(row, oldRow, errors){
    status = row.Status;
    num = row.experimentNumber;
    trackids.push(row.Key);
}

function complete() {
    console.log("output");
    console.log(trackids);
    console.log(status);
    console.log(num);
    WNPRC.Utils.getJavaHelper().sendViralLoadQueueNotification(trackids, status, hostName, num);
}

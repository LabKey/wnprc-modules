var console = require("console");
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
var LABKEY = require("labkey");

function afterUpdate(row, oldRow, errors){
    var key  = row.key;
    var status = row.Status;
    var hostName =  'https://' + LABKEY.serverName;
    console.log("method");
    console.log(row.bulk);
    WNPRC.Utils.getJavaHelper().sendViralLoadQueueNotification(key, status, hostName);
}


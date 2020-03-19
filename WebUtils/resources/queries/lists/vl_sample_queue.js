var console = require("console");
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
var LABKEY = require("labkey");

function beforeUpdate(row, oldRow, errors){
    var key  = row.key;
    var hostName =  'https://' + LABKEY.serverName;
    WNPRC.Utils.getJavaHelper().sendViralLoadQueueNotification(key, hostName);

}


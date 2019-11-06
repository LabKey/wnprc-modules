var console = require("console");
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
var LABKEY = require("labkey");

function afterInsert (row, errors){
    var key  = row.key;
    var hostName =  'https://' + LABKEY.serverName;
    WNPRC.Utils.getJavaHelper().sendProjectNotification(key, hostName);
}

function beforeUpdate(row, oldRow, errors){
    var key  = row.key;
    var hostName =  'https://' + LABKEY.serverName;
    WNPRC.Utils.getJavaHelper().sendProjectNotification(key, hostName);
}
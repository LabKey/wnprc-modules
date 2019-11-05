var console = require("console");
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
var LABKEY = require("labkey");

function beforeInsert (row, errors){
    console.log("added a project request "+ row.key);
    console.log ("");
    var key  = row.key;
    var hostName =  'https://' + LABKEY.serverName;


    WNPRC.Utils.getJavaHelper().sendProjectNotification(hostName);
    //EHR.Server.Utils.sendEmail({});
}

function beforeUpdate(row, errors){
    console.log("value of name "+row.name +" " + row.key);
    var key  = row.key;
    var hostName =  'https://' + LABKEY.serverName;
    WNPRC.Utils.getJavaHelper().sendProjectNotification(key, hostName);

}

//This is REQUIRED to make the script functions (onInit, onComplete, etc.) work.
require("ehr/triggers").initScript(this);

//Sets up class variables.
EHR.Server.Utils = require("ehr/utils").EHR.Server.Utils;
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
var LABKEY = require("labkey");
var console = require("console");

//This is called when the death record is officially submitted.
function onComplete(event, errors, helper) {
    console.log("deaths.js: ONCOMPLETE (correct version)");

    //Gets ID's.
    var ids = helper.getRows().map(function (row) {
        return row.row.id;
    });

    //Sends notification.
    var hostName = 'https://' + LABKEY.serverName;
    WNPRC.Utils.getJavaHelper().sendDeathNotification(ids, hostName);
}
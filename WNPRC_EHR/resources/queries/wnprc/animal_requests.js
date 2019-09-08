//Uses java helper to fire email notification when request is submitted

var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
var console = require("console");
var LABKEY = require("labkey");

var exports = {};

function onInit(event, helper){
    helper.registerRowProcessor(function(helper, row) {
        if (!row)
            return;
    })
}

function beforeInsert(row, errors){
    if (this.extraContext.targetQC) {
        row.QCStateLabel = this.extraContext.targetQC;
    }
}

function beforeUpdate(row, oldRow, errors){

}

function onComplete(event,errors, helper) {

}

function afterInsert(row, errors){
    var rowid = row.rowId;
    var hostName = 'https://' + LABKEY.serverName;
    console.log ("animal_requests.js: New request submitted, rowid: "+ rowid);
    WNPRC.Utils.getJavaHelper().sendAnimalRequestNotification(rowid, hostName);
}


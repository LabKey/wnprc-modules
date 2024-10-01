
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
    var animalDateMap= [];
    let clientRows = helper.getRows();

    console.log("number of rows "+ clientRows.length);
    if (clientRows){

        for (var i= 0; i < clientRows.length; i++){
            console.log("animalId "+clientRows[i].row.id);

            animalDateMap.push({
                animalId: clientRows[i].row.id,
                deathDate : clientRows[i].row.date
            });

        }

    }
    /*console.log("array line 37 " + Object.values(animalDateMap).length);

    for (var i = 0; i < animalDateMap.length; i++){
        console.log("array value " + animalDateMap[i]);
    }*/

    WNPRC.Utils.getJavaHelper().removeWaterAmounts(animalDateMap);

    //Sends notification.
    var hostName = 'https://' + LABKEY.serverName;
    WNPRC.Utils.getJavaHelper().sendDeathNotification(ids, hostName);



}
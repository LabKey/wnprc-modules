/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

//This is REQUIRED to make the script functions (onInit, onComplete, etc.) work.
require("ehr/triggers").initScript(this);

//Sets up class variables.
EHR.Server.Utils = require("ehr/utils").EHR.Server.Utils;
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
var LABKEY = require("labkey");
var console = require("console");

//This (onInit) is called whenever there are changes made to fields in the 'Enter Prenatal Deaths' page.
function onInit(event, helper){
    helper.setScriptOptions({
        allowDeadIds: true,
        allowAnyId: true,
        skipIdFormatCheck: true
    });
}

function setDescription(row, helper){
    //we need to set description for every field
    var description = new Array();

    if(row.species)
        description.push('Species: '+row.species);
    if(row.gender)
        description.push('Gender: '+row.gender);
    if(row.weight)
        description.push('Weight: '+row.weight);
    if(row.dam)
        description.push('Dam: '+row.dam);
    if(row.sire)
        description.push('Sire: '+row.sire);
    if(row.room)
        description.push('Room: '+row.room);
    if(row.cage)
        description.push('Cage: '+row.cage);
    if(row.conception)
        description.push('Conception: '+row.conception);

    return description;
}

//TODO: Decide if we should keep this function.
//Checks the 'study' > 'Prenatal Deaths' query to see if this animal exists already.
function hasAnimalNotificationBeenSent(animalID) {
    var retValue = 0;
    LABKEY.Query.selectRows({
        schemaName:'study',
        queryName:'Prenatal Deaths',
        filterArray:[
            LABKEY.Filter.create('Id', animalID, LABKEY.Filter.Types.EQUAL),
            LABKEY.Filter.create('enddate', null, LABKEY.Filter.Types.ISBLANK)
        ],
        scope:this,
        success: function(data){
            if (data && data.rows && data.rows.length) {
                console.log('No notification of the death of animal ' + animalID + ' has been created.');
            } else {
                retValue = 1;
            }
        }
    });
    return retValue;
}

//TODO: Decide if we should keep this function.
//Updates the 'study' > 'Prenatal Deaths' query with this animal ID.
function addNotificationIndicator(animalID) {
    var updObj = {Id:animalID};
    LABKEY.Query.selectRows({
        schemaName:'study',
        queryName:'Prenatal Deaths',
        filterArray: [
            LABKEY.Filter.create('Id', animalID, LABKEY.Filter.Types.EQUAL),
            LABKEY.Filter.create('enddate',null, LABKEY.Filter.Types.ISBLANK)
        ],
        scope:this,
        success: function(data){
            if (data && data.rows && data.rows.length) {
                console.log('Adding notification indicator for participant ' + animalID);
                var updRow = data.rows[0];
                var updObj = {
                    Id: updRow.Id,
                    enddate: updRow.date,
                    sire: updRow.sire,
                    dam: updRow.dam
                };
                LABKEY.Query.updateRows({
                    schemaName:'study',
                    queryName:'Prenatal Deaths',
                    scope: this,
                    rows: [updObj],
                    success: function(data) {
                        console.log('Successfully added indicator for ' + animalID);
                    },
                    failure: EHR.Server.Utils.onFailure
                });
            }
        }
    });
}

//This is called when the prenatal death record is officially submitted.
function onComplete(event, errors, helper){
    console.log("prenatal.js: ONCOMPLETE (correct version)");

    //Notification revamp method.
    //Gets ID's.
    var ids = helper.getRows().map(function (row) {
        return row.row.id;
    });
    //Sends notification.
    var hostName = 'https://' + LABKEY.serverName;
    WNPRC.Utils.getJavaHelper().sendDeathNotification(ids, hostName);
};
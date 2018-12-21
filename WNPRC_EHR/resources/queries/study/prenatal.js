/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);
EHR.Server.Utils = require("ehr/utils").EHR.Server.Utils;

var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

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

function onComplete(event, errors, helper){
    if (helper.getPublicParticipantsModified().length) {
        var valuesMap = {};
        var r;

        //Support for multiple prenatals
        for (var i=0; i < helper.getRows().length; i++) {
            r = helper.getRows()[i];
            if (hasAnimalNotificationBeenSent(r.row.Id) && !helper.getExtraContext().resendEmail) {
                continue;
            }
            else {
                valuesMap[r.row.Id]              = {};
                valuesMap[r.row.Id].death        = r.row.date;
                valuesMap[r.row.Id].animalNumber = r.row.Id;
                valuesMap[r.row.Id].notified     = 0;
                valuesMap[r.row.Id].dam          = r.row.dam;
                valuesMap[r.row.Id].conception   = r.row.conception;
                valuesMap[r.row.Id].gender       = WNPRC.Utils.lookupGender(r.row.gender);
                valuesMap[r.row.Id].sire         = r.row.sire;

                valuesMap[r.row.Id].manner       = r.row.manner;
                valuesMap[r.row.Id].cause        = r.row.cause;
                valuesMap[r.row.Id].necropsy     = r.row.necropsy;

                var aDate = new Date(valuesMap[r.row.Id].death.toGMTString());
                var monthString =  EHR.Server.Utils.getMonthString(aDate.getMonth());
                var minStr = aDate.getMinutes() >= 10 ? aDate.getMinutes() : '0' + aDate.getMinutes();
                valuesMap[r.row.Id].deathDate = aDate.getDate() + ' ' + monthString +  ' ' + aDate.getFullYear();
                valuesMap[r.row.Id].deathTime = aDate.getHours() + ':' + minStr;

                //Get necropsy-specific information
                LABKEY.Query.selectRows({
                    schemaName: 'study',
                    queryName:  'necropsy',
                    filterArray: [
                        LABKEY.Filter.create('Id', r.row.Id, LABKEY.Filter.Types.EQUAL)
                    ],
                    scope: this,
                    success: function(data) {
                        if (data && data.rows.length) {
                            var nDate= data.rows[0].date;
                            aDate = new Date(nDate);
                            monthString = EHR.Server.Utils.getMonthString(aDate.getMonth());
                            valuesMap[r.row.Id].necropsyDate = aDate.getDate() + ' ' + monthString + ' ' + aDate.getFullYear();
                            if (valuesMap[r.row.Id].grant == undefined) {
                                valuesMap[r.row.Id].grant = data.rows[0].account;
                            }
                            valuesMap[r.row.Id].necropsy = data.rows[0].caseno;
                        }
                    }
                });

                //Get weight for animal
                LABKEY.Query.selectRows({
                    schemaName: 'study',
                    queryName:  'Weight',
                    filterArray: [
                        LABKEY.Filter.create('Id', r.row.Id, LABKEY.Filter.Types.EQUAL)
                    ],
                    scope: this,
                    success: function(data) {
                        if (data.rows && data.rows.length) {
                            var wRow = data.rows[0];
                            valuesMap[r.row.Id].weight  = wRow.weight;
                        }
                    }
                });
            }
        }
        var theMsg = new String();
        var count = 0;
        for (var k in valuesMap) {
            var obj = valuesMap[k];
            if (obj.notified) {
                continue;
            }
            else {
                count++;
                theMsg += "Necropsy Number:            " + obj.necropsy     + "<br>";
                theMsg += "Necropsy Date  :            " + obj.necropsyDate + "<br>";
                theMsg += "Animal Number  :            " + obj.animalNumber + "<br>";
                theMsg += "Dam:                        " + obj.dam          + "<br>";
                theMsg += "Weight:                     " + obj.weight   + " kg <br>";
                theMsg += "Sex:                        " + obj.gender       + "<br>";
                theMsg += "Date of Death:              " + obj.deathDate    + "<br>";
                theMsg += "Time of Death:              " + obj.deathTime    + "<br>";
                theMsg += "Death:                      " + obj.cause        + "<br>";
                theMsg += "Grant #:                    " + obj.grant        + "<br>";
                if (obj.cause == 'Clinical') {
                    theMsg += "Animal Replacement Fee:     " + "No Animal replacement fee to be paid (clinical death) <br>";
                }
                theMsg += "Manner of Death:            " + obj.manner + "<br><br>";

                addNotificationIndicator(obj.animalNumber);
            }
        }

        var openingLine;
        if (count > 1) {
            openingLine = 'The following animals have been marked as dead:<br><br>';
        }
        else if (count == 1 ) {
            openingLine = 'The following animal has been marked as dead:<br><br>';
        }

        if (count > 0) {
            EHR.Server.Utils.sendEmail({
                notificationType: 'Prenatal Death',
                msgContent: openingLine  + theMsg +
                        helper.getPublicParticipantsModified().join(',<br>') +
                        '<p></p><a href="'+LABKEY.ActionURL.getBaseURL()+'ehr' + LABKEY.ActionURL.getContainer() + '/animalHistory.view#inputType:multiSubject&subjects:'+helper.getPublicParticipantsModified().join(';')+'&activeReport:abstract' +
                        '">Click here to view them</a>.',

                msgSubject: 'Prenatal Death Notification'
            });
        }
    }
};
/*
 * Copyright (c) 2010-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInit(event, helper){
    helper.setScriptOptions({
        skipHousingCheck: true
    });

    helper.decodeExtraContextProperty('housingInTransaction');

    helper.registerRowProcessor(function(helper, row){
        if (!row)
            return;

        if (!row.Id || !row.room){
            return;
        }

        var housingInTransaction = helper.getProperty('housingInTransaction');
        housingInTransaction = housingInTransaction || {};
        housingInTransaction[row.Id] = housingInTransaction[row.Id] || [];

        // this is a failsafe in case the client did not provide housing JSON.  it ensures
        // the current row is part of housingInTransaction
        var shouldAdd = true;
        if (row.objectid){
            LABKEY.ExtAdapter.each(housingInTransaction[row.Id], function(r){
                if (r.objectid == row.objectid){
                    shouldAdd = false;
                    return false;
                }
            }, this);
        }

        if (shouldAdd){
            housingInTransaction[row.Id].push({
                objectid: row.objectid,
                date: row.date,
                enddate: row.enddate,
                qcstate: row.QCState,
                room: row.room,
                cage: row.cage,
                divider: row.divider
            });
        }

        helper.setProperty('housingInTransaction', housingInTransaction);
    });    
}

function onUpsert(helper, scriptErrors, row, oldRow){
    //check for existing animals in this room/cage
    if (!helper.isETL() && !helper.isQuickValidation() && row.room && row.cage && !row.enddate){
        var existingIds = helper.getJavaHelper().findExistingAnimalsInCage(row.Id, row.room, row.cage);
        if (existingIds > 0){
            EHR.Server.Utils.addError(scriptErrors, 'Id', 'There are ' + existingIds + ' animal(s) already in this location', 'INFO');
        }
    }

    //the editors dont let us record this precision anyway, and it just throws off date overlaps
    if (row.date){
        row.date.setSeconds(0);
    }

    if (row.enddate){
        row.enddate.setSeconds(0);
    }

    //verify we dont have 2 opened records for the same ID
    if (!helper.isETL() && !row.enddate && row.Id){
        var map = helper.getProperty('housingInTransaction');
        if (map && map[row.Id]){
            var housingRecords = map[row.Id];
            for (var i=0;i<housingRecords.length;i++){
                if (row.objectid == housingRecords[i].objectid){
                    console.log ('same housing record');
                    continue;
                }

                if (!housingRecords[i].enddate){
                    EHR.Server.Utils.addError(scriptErrors, 'enddate', 'Cannot enter multiple open-ended housing records for the same animal', 'WARN');
                }
            }
        }
    }

    if (!helper.isETL() && row && row.Id && row.date && !row.enddate){
        var objectid = row.objectid || null;
        //if this record is active and public, deactivate any old housing records
        var map = helper.getProperty('housingInTransaction');
        var housingRecords = [];
        if (map && map[row.Id]){
            housingRecords = map[row.Id];
        }

        //NOTE: downstream java code should handle type conversion of housingInTransaction
        var msg = helper.getJavaHelper().validateFutureOpenEndedHousing(row.Id, row.date, objectid, housingRecords);
        if (msg){
            EHR.Server.Utils.addError(scriptErrors, 'Id', msg, 'WARN');
        }
    }
}

EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.ON_BECOME_PUBLIC, 'study', 'Housing', function(scriptErrors, helper, row, oldRow) {
    helper.registerHousingChange(row.id, row);
});

function onComplete(event, errors, helper){
    if (!helper.isETL() && !helper.isValidateOnly()){
        var housingRows = helper.getRows();
        var idsToClose = [];
        if (housingRows){
            for (var i=0;i<housingRows.length;i++){
                if (housingRows[i].row.date){
                    idsToClose.push({
                        Id: housingRows[i].row.Id,
                        date: EHR.Server.Utils.datetimeToString(housingRows[i].row.date),  //stringify to serialize properly
                        objectid: housingRows[i].row.objectid
                    });
                }
            }
        }

        if (idsToClose.length){
            //NOTE: this list should be limited to 1 row per animalId
            helper.getJavaHelper().closeHousingRecords(idsToClose);
        }
    }
}
/*
 * Copyright (c) 2018-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

function onInit(event, helper){
    helper.setScriptOptions({
        allowFutureDates: true,
        removeTimeFromDate: true,
        skipAssignmentCheck: true
    });

    helper.decodeExtraContextProperty('assignmentsInTransaction', []);

    helper.registerRowProcessor(function(helper, row){
        if (!row)
            return;

        if (!row.Id || !row.project){
            return;
        }

        var assignmentsInTransaction = helper.getProperty('assignmentsInTransaction');
        assignmentsInTransaction = assignmentsInTransaction || [];

        var shouldAdd = true;
        if (row.objectid){
            LABKEY.ExtAdapter.each(assignmentsInTransaction, function(r){
                if (r.objectid == row.objectid){
                    shouldAdd = false;
                    return false;
                }
            }, this);
        }

        if (shouldAdd){
            assignmentsInTransaction.push({
                Id: row.Id,
                objectid: row.objectid,
                date: row.date,
                enddate: row.enddate,
                qcstate: row.QCState,
                project: row.project
            });
        }

        helper.setProperty('assignmentsInTransaction', assignmentsInTransaction);
    });
}

function onUpsert(helper, scriptErrors, row, oldRow){
    if (!helper.isETL()){
        //note: the the date field is handled above by removeTimeFromDate
        EHR.Server.Utils.removeTimeFromDate(row, scriptErrors, 'enddate');
        EHR.Server.Utils.removeTimeFromDate(row, scriptErrors, 'projectedRelease');
    }

    //remove the projected release date if a true enddate is added
    if (row.enddate && row.projectedRelease){
        row.projectedRelease = null;
    }

    //check number of allowed animals at assign/approve time
    if (!helper.isETL() && !helper.isQuickValidation() &&
            //this is designed to always perform the check on imports, but also updates where the Id was changed
            !(oldRow && oldRow.Id && oldRow.Id==row.Id) &&
            row.Id && row.project && row.date
    ){
        var assignmentsInTransaction = helper.getProperty('assignmentsInTransaction');
        assignmentsInTransaction = assignmentsInTransaction || [];
        var msgs = WNPRC.Utils.getJavaHelper().verifyProtocolCounts(row.Id, row.project, assignmentsInTransaction);
        if (msgs){
            msgs = msgs.split("<>");
            for (var i=0;i<msgs.length;i++){
                EHR.Server.Utils.addError(scriptErrors, 'project', msgs[i], 'WARN');
            }
        }
    }

    //check that the animal request exists!
    if (row.animal_request_rowid) {
        if (!WNPRC.Utils.getJavaHelper().checkAnimalRequestExists(row.animal_request_rowid)){
            EHR.Server.Utils.addError(scriptErrors, 'animal_request_rowid', "Animal Request does not exist", 'ERROR');
        }
    }
}
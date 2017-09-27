/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInit(event, helper){
    helper.setScriptOptions({
        allowAnyId: true,
        allowDeadIds: true,
        skipIdFormatCheck: true
    });

    helper.registerRowProcessor(function(helper, row){
        if (!row)
            return;

        if (!row.Id || !row.weight){
            return;
        }

        var weightInTransaction = helper.getProperty('weightInTransaction');
        weightInTransaction = weightInTransaction || {};
        weightInTransaction[row.Id] = weightInTransaction[row.Id] || [];

        var shouldAdd = true;
        if (row.objectid){
            LABKEY.ExtAdapter.each(weightInTransaction[row.Id], function(r){
                if (r.objectid == row.objectid){
                    if (r.weight != row.weight){
                        r.weight = row.weight;
                    }
                    else {
                        shouldAdd = false;
                        return false;
                    }
                }
            }, this);
        }

        if (shouldAdd){
            weightInTransaction[row.Id].push({
                objectid: row.objectid,
                date: row.date,
                qcstate: row.QCState,
                weight: row.weight
            });
        }

        helper.setProperty('weightInTransaction', weightInTransaction);
    });
}

function onUpsert(helper, scriptErrors, row, oldRow){
    if (!row.weight){
        EHR.Server.Utils.addError(scriptErrors, 'weight', 'This field is required', 'WARN');
    }

    // warn if more than 10% different from last weight
    // the highest error this can produce is WARN.  therefore skip this check if we would ignore it anyway in order to save the overhead.
    // this would normally occur when finalizing a form
    if (!helper.isETL() && row.Id && row.weight && EHR.Server.Utils.shouldIncludeError('WARN', helper.getErrorThreshold(), helper)){
        EHR.Server.Utils.findDemographics({
            participant: row.Id,
            helper: helper,
            scope: this,
            callback: function(data){
                if (!data)
                    return;

                if (data.mostRecentWeight && (row.weight <= data.mostRecentWeight * 0.9)){
                    EHR.Server.Utils.addError(scriptErrors, 'weight', 'Weight drop of >10%. Last weight ' + data.mostRecentWeight + ' kg', 'INFO');
                }
                else if (data.mostRecentWeight && (row.weight >= data.mostRecentWeight / 0.9)){
                    EHR.Server.Utils.addError(scriptErrors, 'weight', 'Weight gain of >10%. Last weight ' + data.mostRecentWeight + ' kg', 'INFO');
                }

                if (data && data.species){
                    var msg = helper.getJavaHelper().verifyWeightRange(row.id, row.weight, data.species);
                    if (msg != null){
                        EHR.Server.Utils.addError(scriptErrors, 'weight', msg, 'WARN');
                    }
                }
            }
        });
    }
}
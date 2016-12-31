/*
 * Copyright (c) 2010-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.AFTER_BECOME_PUBLIC, 'study', 'Blood Draws', function(errors, helper, row, oldRow){
    if (row && row.additionalServices){
        helper.getJavaHelper().createRequestsForBloodAdditionalServices(row.Id, row.date, row.project, row.account, row.performedby, row.additionalServices, (row.requestid||null));
    }
});

function onInit(event, helper){
    helper.decodeExtraContextProperty('bloodInTransaction');
    helper.decodeExtraContextProperty('weightInTransaction');

    helper.registerRowProcessor(function(helper, row){
        if (!row)
            return;

        if (!row.Id || !row.quantity){
            return;
        }

        var bloodInTransaction = helper.getProperty('bloodInTransaction');
        bloodInTransaction = bloodInTransaction || {};
        bloodInTransaction[row.Id] = bloodInTransaction[row.Id] || [];

        var shouldAdd = true;
        if (row.objectid){
            LABKEY.ExtAdapter.each(bloodInTransaction[row.Id], function(r){
                if (r.objectid == row.objectid){
                    if (r.quantity != row.quantity){
                        r.quantity = row.quantity;
                    }
                    else {
                        shouldAdd = false;
                        return false;
                    }
                }
            }, this);
        }

        if (shouldAdd){
            bloodInTransaction[row.Id].push({
                objectid: row.objectid,
                date: row.date,
                qcstate: row.QCState,
                quantity: row.quantity
            });
        }

        helper.setProperty('bloodInTransaction', bloodInTransaction);
    });
}

function onUpsert(helper, scriptErrors, row, oldRow){
    if (!helper.isETL() && row.date && !row.daterequested){
        if (!oldRow || !oldRow.daterequested){
            row.daterequested = row.date;
        }
    }

    if (row.quantity === 0){
        EHR.Server.Utils.addError(scriptErrors, 'quantity', 'This field is required', 'WARN');
    }

    if (!helper.isETL()){
        if (row.date && !row.requestdate)
            row.requestdate = row.date;

        if (!row.quantity && row.num_tubes && row.tube_vol){
            row.quantity = row.num_tubes * row.tube_vol;
        }

        if (row.additionalServices) {
            if (row.tube_type || row.tube_vol){
                var tubeType = row.tube_type || null;
                var quantity = row.quantity || 0;
                var msgs = helper.getJavaHelper().validateBloodAdditionalServices(row.additionalServices, tubeType, quantity);
                if (msgs && msgs.length){
                    LABKEY.ExtAdapter.each(msgs, function(msg){
                        EHR.Server.Utils.addError(scriptErrors, 'additionalServices', msg, 'INFO');
                    }, this);
                }
            }
        }

        if (row.quantity && row.tube_vol){
            if (row.quantity != (row.num_tubes * row.tube_vol)){
                EHR.Server.Utils.addError(scriptErrors, 'quantity', 'Quantity does not match tube vol / # tubes', 'INFO');
                EHR.Server.Utils.addError(scriptErrors, 'num_tubes', 'Quantity does not match tube vol / # tubes', 'INFO');
            }
        }

        EHR.Server.Validation.checkRestraint(row, scriptErrors);

        if (row.Id && row.date && row.quantity){
            // volume is handled differently for requests vs actual draws
            var errorQC;
            if (EHR.Server.Security.getQCStateByLabel(row.QCStateLabel)['isRequest'] && !row.taskid)
                errorQC = 'ERROR';
            else
                errorQC = 'INFO';

            var map = helper.getProperty('bloodInTransaction');
            var draws = [];
            if (map && map[row.Id]){
                draws = map[row.Id];
            }

            var weightMap = helper.getProperty('weightInTransaction');
            var weights = [];
            if (weightMap && weightMap[row.Id]){
                weights = weightMap[row.Id];
            }

            if (row.objectid) {
                var msg = helper.getJavaHelper().verifyBloodVolume(row.id, row.date, draws, weights, row.objectid || null, row.quantity);
                if (msg != null) {
                    //TODO: change all future bloods draws to review required, if submitted for medical purpose.
                    EHR.Server.Utils.addError(scriptErrors, 'num_tubes', msg, errorQC);
                    EHR.Server.Utils.addError(scriptErrors, 'quantity', msg, errorQC);
                }
            }
            else {
                console.warn('objectid not provided for blood draw, cannot calculate allowable blood volume.  this probably indicates an error with the form submitting these data')
            }
        }
    }
}
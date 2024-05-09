require("ehr/triggers").initScript(this);
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

function onInit(event, helper){
    helper.setScriptOptions({
        allowAnyId: true,
        allowDeadIds: true,
        skipIdFormatCheck: true,
        allowDatesInDistantPast: true
    });
}
function onUpsert(helper, scriptErrors, row, oldRow){

    //validate that the dam is female
    if (row.Id){
        EHR.Server.Validation.verifyIsFemale(row, scriptErrors, helper);
        //row.QCState = EHR.Server.Security.getQCStateByLabel('Completed').RowId;
        row.QCStateLabel = EHR.Server.Security.getQCStateByLabel('Completed').Label;
    }

    //validate that the sire is male
    if (row.sireid) {
        //validate that the sire(s) are male, alive, and not duplicated
        if (row.sireid) {
            row.sireid = row.sireid.replace(/\s+/g, '');
            let ids = row.sireid.split(',');
            let duplicateCount = [];

            for (let i = 0; i < ids.length; i++) {
                let id = ids[i].trim();
                EHR.Server.Utils.findDemographics({
                    participant: id,
                    helper: helper,
                    scope: this,
                    callback: function (data) {
                        if (data) {
                            if (data['gender/origGender'] && data['gender/origGender'] !== 'm') {
                                EHR.Server.Utils.addError(scriptErrors, 'sireid', 'This animal (' + id + ') is not male', 'ERROR');
                            }
                            if (data['calculated_status'] && data.calculated_status !== 'Alive'){
                                EHR.Server.Utils.addError(scriptErrors, 'sireid', 'This animal (' + id + ') is not alive', 'INFO');
                            }
                        }
                    }
                });

                if (duplicateCount[id] === undefined) {
                    duplicateCount[id] = 1;
                } else {
                    EHR.Server.Utils.addError(scriptErrors, 'sireid', 'This animal (' + id + ') is listed more than once', 'ERROR');
                }
            }
        }
    }

    if (!row.breedingencounterid) {
        EHR.Server.Utils.addError(scriptErrors, 'breedingencounterid', 'Field should ALWAYS be filled in unless actually unknown', 'WARN');
    }
}

function onComplete(event, errors, helper){
    let pregnancyRows = helper.getRows();
    let updateRows = [];

    if (pregnancyRows){
        for (let i = 0; i < pregnancyRows.length; i++) {
            var updateRow = {};
            if (pregnancyRows[i].row.breedingencounterid) {
                updateRows.push(pregnancyRows[i].row.breedingencounterid);
            }
        }
        WNPRC.Utils.getJavaHelper().updateBreedingOutcome(updateRows);
    }

    // let ids = helper.getRows().map(function (pregnancy) {
    //     return pregnancy.row.Id;
    // });
    //
    // let objectids = helper.getRows().map(function (pregnancy) {
    //     return pregnancy.row.objectid;
    // });
    //
    // WNPRC.Utils.getJavaHelper().sendPregnancyNotification(ids, objectids);
}
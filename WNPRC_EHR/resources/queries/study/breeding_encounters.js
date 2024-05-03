require("ehr/triggers").initScript(this);

function onInit(event, helper){
    helper.setScriptOptions({
        allowAnyId: true,
        allowDeadIds: true,
        skipIdFormatCheck: true,
        allowDatesInDistantPast: true
    });
}
function onUpsert(helper, scriptErrors, row, oldRow){

    //validate that the dam is female and alive
    if (row.Id){
        EHR.Server.Validation.verifyIsFemale(row, scriptErrors, helper);

        EHR.Server.Utils.findDemographics({
            participant: row.Id,
            helper: helper,
            scope: this,
            callback: function (data) {
                if (data) {
                    if (data['calculated_status'] && data['calculated_status'] !== 'Alive'){
                        EHR.Server.Utils.addError(scriptErrors, 'id', 'This animal (' + row.Id + ') is not alive', 'INFO');
                    }
                }
            }
        });

        if (row.date && row.enddate) {
            //row.QCState = EHR.Server.Security.getQCStateByLabel('Completed').RowId;
            row.QCStateLabel = EHR.Server.Security.getQCStateByLabel('Completed').Label;
        }
        row.ejaculation = !!row.ejaculation;
        row.outcome = !!row.outcome;
    }

    //validate that the sire(s) are male, alive, and not duplicated
    //also strip any non alphanumeric characters and separate sire ids by a comma
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
var console = require('console');
require("ehr/triggers").initScript(this);
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

function onUpsert(helper, scriptErrors, row, oldRow){

    //validate that the dam is female
    if (row.Id){
        EHR.Server.Validation.verifyIsFemale(row, scriptErrors, helper);
        row.QCState = EHR.Server.Security.getQCStateByLabel('Completed').RowId
    }

    //validate that the sire is male
    if (row.sireid) {
        EHR.Server.Utils.findDemographics({
            participant: row.sireid,
            helper: helper,
            scope: this,
            callback: function (data) {
                if (data) {
                    if (data['gender/origGender'] && data['gender/origGender'] !== 'm')
                        EHR.Server.Utils.addError(scriptErrors, 'sireid', 'This animal is not male', 'ERROR');
                }
            }
        });
    }
}

function onComplete(event, errors, helper){
    let pregnancyRows = helper.getRows();
    let updateRows = [];

    if (pregnancyRows){
        for (let i = 0; i < pregnancyRows.length; i++) {
            var updateRow = {};
            updateRows.push(pregnancyRows[i].row.breedingencounterid);
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
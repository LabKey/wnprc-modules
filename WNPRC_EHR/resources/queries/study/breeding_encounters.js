var console = require('console');
require("ehr/triggers").initScript(this);

function onUpsert(helper, scriptErrors, row, oldRow){
    console.log(row);

    if (row.Id){
        EHR.Server.Validation.verifyIsFemale(row, scriptErrors, helper);
    }

    if (row.sireid) {
        EHR.Server.Utils.findDemographics({
            participant: row.sireid,
            helper: helper,
            scope: this,
            callback: function (data) {
                if (data) {
                    if (data['gender/origGender'] && data['gender/origGender'] != 'm')
                        EHR.Server.Utils.addError(scriptErrors, 'sireid', 'This animal is not male', 'ERROR');
                }
            }
        });
    }
}
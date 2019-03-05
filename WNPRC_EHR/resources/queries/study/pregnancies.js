var console = require('console');
require("ehr/triggers").initScript(this);

function onUpsert(helper, scriptErrors, row, oldRow){

    //validate that the dam is female
    if (row.Id){
        EHR.Server.Validation.verifyIsFemale(row, scriptErrors, helper);
    }

    //validate that the sire is male
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

function onComplete(event, errors, helper){
    var pregnancyRows = helper.getRows();
    var updateRows = [];

    if (pregnancyRows){
        for (var i=0;i<pregnancyRows.length;i++){
            var updateRow = {};
            updateRow.lsid = pregnancyRows[i].row.breedingencounterid;
            updateRow.outcome = true;
            updateRows.push(updateRow);
        }
        LABKEY.Query.updateRows( {
            schemaName : 'study',
            queryName : 'breeding_encounters',
            rows : updateRows,
            success: function (data) {
                console.log('success');
                if (data && data.rows) {
                    //nothing
                }
            },
            failure : EHR.Server.Utils.onFailure
        });
    }
}
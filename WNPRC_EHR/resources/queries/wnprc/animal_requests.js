var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;
var console = require("console");
var LABKEY = require("labkey");
require("ehr/triggers").initScript(this);

function onInit(event, helper){
    helper.setScriptOptions({
        allowDatesInDistantPast: true
    });
}

function beforeInsert(row, errors){
    if (this.extraContext.targetQC) {
        row.QCStateLabel = this.extraContext.targetQC;
    }
}

function onUpsert(helper, scriptErrors, row, oldRow){
    var animalIdsString = row.animalidstooffer;
    if (!animalIdsString){
        return;
    }

    //split ids into an array
    var subjectArray = WNPRC.Utils.splitIds(animalIdsString);
    //after split, check if unique
    if (!WNPRC.Utils.unique(subjectArray))
        EHR.Server.Utils.addError(scriptErrors, 'animalidstooffer', 'Contains duplicate animal ids.', 'ERROR');

    for (var i = 0; i < subjectArray.length; i++) {
        var id = subjectArray[i];
        console.log(id)
        EHR.Server.Utils.findDemographics({
            participant: id,
            helper: helper,
            scope: this,
            callback: function (data) {
                if (data) {
                    console.log(data)
                    if (data['calculated_status'] && data.calculated_status !== 'Alive') {
                        EHR.Server.Utils.addError(scriptErrors, 'animalidstooffer', 'This animal (' + id + ') is not alive', 'ERROR');
                    }
                    if (data['calculated_status'] == null) {
                        EHR.Server.Utils.addError(scriptErrors, 'animalidstooffer', 'This animal (' + id + ') does not exist', 'ERROR');
                    }
                }
            },
            failure: function (d) {
                EHR.Server.Utils.addError(scriptErrors, 'animalidstooffer', 'Communication error', 'ERROR');
            }
        });
    }
    row.animalidstooffer = subjectArray.join(";");

}

function onComplete(event,errors, helper) {

}

function afterInsert(row, errors){
    var rowid = row.rowId;
    var hostName = 'https://' + LABKEY.serverName;
    console.log ("animal_requests.js: New request submitted, rowid: "+ rowid);
    WNPRC.Utils.getJavaHelper().sendAnimalRequestNotification(rowid, hostName);
}


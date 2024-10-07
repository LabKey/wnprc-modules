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

    //only do this operation for an insert (oldRow is blank)
    if (typeof(oldRow) == 'undefined') {
        if (!!row.optionalproject && typeof(row.project) == 'undefined'){
            //if the optional project is something other than a number (TBD) then we need to leave project blank
            // because the ehr triggers.js requires it to be a number.
            if (!isNaN(row.optionalproject)){
                row.project = row.optionalproject
            }
        }
    }

    //sanity checks for date fields
    if (row.anticipatedstartdate > row.anticipatedenddate) {
        EHR.Server.Utils.addError(scriptErrors, 'anticipatedenddate', 'Anticipated end date is before anticipated start date.')
    }

    //sanitize 'animalidstooffer' field
    var subjectArray = row.animalidstooffer;
    if (!subjectArray){
        return;
    }

    var subjectArray = WNPRC.Utils.splitIds(subjectArray);
    //after split, check if unique
    if (!WNPRC.Utils.unique(subjectArray))
        EHR.Server.Utils.addError(scriptErrors, 'animalidstooffer', 'Contains duplicate animal ids.', 'INFO');

    for (var i = 0; i < subjectArray.length; i++) {
        var id = subjectArray[i];
        EHR.Server.Utils.findDemographics({
            participant: id,
            helper: helper,
            scope: this,
            callback: function (data) {
                if (data) {
                    if (data['calculated_status'] && data.calculated_status !== 'Alive') {
                        EHR.Server.Utils.addError(scriptErrors, 'animalidstooffer', 'This animal (' + id + ') is not alive', 'INFO');
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

function onAfterInsert(helper,errors,row){
    var rowid = row.rowId;
    var hostName = 'https://' + LABKEY.serverName;
    console.log ("animal_requests.js: New request submitted, rowid: "+ rowid);
    LABKEY.Ajax.request({
        url: LABKEY.ActionURL.buildURL('core', 'getModuleProperties', null),
        method: 'POST',
        jsonData: {moduleName: 'WNPRC_EHR', includePropertyValues: true},
        success: LABKEY.Utils.getCallbackWrapper(function (response) {
            console.log("animal_requests.js: creating message boards");
            var threadIdInternal = WNPRC.Utils.getJavaHelper().setUpMessageBoardThread(row, response["values"]["AssignsSecureMessageBoardPrivateFolder"]["effectiveValue"]);
            WNPRC.Utils.getJavaHelper().updateRow(row, threadIdInternal, "wnprc", "animal_requests", "internalthreadrowid");
            var threadIdExternal = WNPRC.Utils.getJavaHelper().setUpMessageBoardThread(row,  response["values"]["AssignsSecureMessageBoardRestrictedFolder"]["effectiveValue"]);
            WNPRC.Utils.getJavaHelper().updateRow(row, threadIdExternal, "wnprc", "animal_requests", "externalthreadrowid");
        }, this),
    });
    WNPRC.Utils.getJavaHelper().sendAnimalRequestNotification(rowid, hostName);
}

function onAfterUpdate(helper,errors,row,oldRow){
    var rowid = row.rowId;
    var hostName = 'https://' + LABKEY.serverName;
    console.log("animal_requests.js: New request updated, rowid: "+ rowid);

    if ("QCStateLabel" in row) {
        delete row.QCState;
        row["qcstate"] = row["QCStateLabel"];
        delete row.QCStateLabel;
    }
    if ("QCStateLabel" in oldRow) {
        oldRow["qcstate"] = oldRow["QCStateLabel"];
        delete oldRow.QCStateLabel;
    }

    if ("_publicData" in row) {
        delete row._publicData;
    }
    if ("_publicData" in oldRow) {
        delete oldRow._publicData;
    }

    WNPRC.Utils.getJavaHelper().sendAnimalRequestNotificationUpdate(rowid, row, oldRow, hostName);
}

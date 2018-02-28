
require("ehr/triggers").initScript(this);
require ("labkey");
require("wnprc_ehr/WNPRC");

function onInit(event, helper){
    helper.setScriptOptions({
        allowFutureDates:true,
        errorSeverityForImproperAssignment: 'WARN'

    });
    //helper.setProperty('quickValidation',true);


}

function onUpsert(helper, scriptErrors, row, oldRow){

    var internalTest=false;

    //setting the value for the next date and removing time
    var nextDate = new Date();
    nextDate.setHours(0,0,0,0);
    nextDate.setDate(nextDate.getDate() + 1);

    //new date base on the UI input and removing the time
    var rowDate = new Date(row.date);
    rowDate.setHours(0,0,0,0);


    if (!(rowDate.getTime()>=nextDate.getTime()) && (row.QCStateLabel == "Scheduled" ||row.QCStateLabel == "Request: Pending" )){
        var errorQC;

        if ((EHR.Server.Security.getQCStateByLabel(row.QCStateLabel)['isRequest'] || row.QCStateLabel == "Scheduled") && !row.taskid){
            errorQC = 'INFO';
        }
        else
            errorQC = 'ERROR';

        EHR.Server.Utils.addError(scriptErrors, 'date', 'Cannot request same day food deprives.', errorQC);
    }

    if (row.schedule == "noon" && !row.remarks){
        EHR.Server.Utils.addError(scriptErrors, 'remarks', 'Must enter remarks with special arrangements for NOON food deprives', 'ERROR');
    }

    console.log("This is the label of qcstate "+ row.QCStateLabel);
    if (row.QCStateLabel == 'Completed' && !row.restoredTime){
        EHR.Server.Utils.addError(scriptErrors,'restoredTime','Need to enter a restore time to submit food deprive','ERROR');

    }

    //test if statement remove once in production. Only allow request for animal in WMIR or A2
    if (row.id && row.QCStateLabel == 'Scheduled'){


        EHR.Server.Utils.findDemographics({
            participant: row.Id,
            helper: helper,
            scope: this,
            callback: function(data){
                if (data){
                    if (row.Id ){
                        var room = data['id/curlocation/room'] ||  '';
                        var WMIRlocation = 'mr';
                        var A2location = 'a2';
                        if (!(room.indexOf(WMIRlocation) == 0 || room.indexOf(A2location) == 0)){
                            EHR.Server.Utils.addError(scriptErrors,'Id','Food deprives are being tested and they can only be requested for WMIR and A2 areas. ' +
                                                                        'Send your request to the Excel schedule.', 'ERROR');
                        }

                    }
                }

            }

        });
    }
}
function beforeUpdate(row, oldRow, scriptErrors){
    if (row.QCStateLabel=='Started' && oldRow.QCStateLabel=='Scheduled' && !row.depriveStartTime){
        EHR.Server.Utils.addError(scriptErrors, 'depriveStartTime', 'Need to enter a start time to start food deprive', 'ERROR');
    }
}
function afterInsert(row, errors){
    var requestid=row.requestId;
    var id = row.id;
    var project = row.project;

    //WNPRC.Utils.getJavaHelper().sendHusbandryNotification(requestid, id, project);

}

function setDescription(row, helper){
    //we need to set description for every field
    console.log ("call setDescription");
    var description = new Array();

    if(row.type)
        description.push('Type: ' + EHR.Server.Utils.nullToString(row.type));

    if(row.amount)
        description.push('Amount: ' + EHR.Server.Utils.nullToString(row.amount));

    return description;
}
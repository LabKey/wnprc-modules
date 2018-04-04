
require("ehr/triggers").initScript(this);
require ("labkey");
require("wnprc_ehr/WNPRC");

function onInit(event, helper){
    helper.setScriptOptions({
        allowFutureDates:true


    });
}

function onUpsert(helper, scriptErrors, row, oldRow){

    //TODO:  add check permissions for allow admins to modify food deprives
    //var dataAdminPermission=EHR.Server.Security.verifyPermissions('update',row,oldRow);

    //setting the value for the next date and removing time
    var nextDate = new Date();
    nextDate.setHours(0,0,0,0);
    nextDate.setDate(nextDate.getDate() + 1);

    //new date base on the UI input and removing the time
    var rowDate = new Date(row.date);
    rowDate.setHours(0,0,0,0);

    //Check permission when requesting food deprive, cannot be schedule for the same day.
    if (!(rowDate.getTime()>=nextDate.getTime()) && (row.QCStateLabel == "Request: Pending")){
        var errorQC;


        if ( row.QCStateLabel == "In Progress" && !oldRow.taskid ){
            errorQC = 'INFO';
        }
        else
            errorQC = 'ERROR';

        EHR.Server.Utils.addError(scriptErrors, 'date', 'Cannot request same day food deprives 1.', errorQC);
    }


    //Checking permission when adding schedule food deprives, we want to allow for data admins to make changes to the row when is scheduled.
    if (oldRow && !(rowDate.getTime()>=nextDate.getTime()) && (oldRow.QCStateLabel == "Scheduled") ){

        if ((row.QCStateLabel == "In Progress" || row.QCStateLabel == "Scheduled") && !row.taskid ){
            EHR.Server.Utils.addError(scriptErrors, 'date', 'Cannot request same day food deprives 2.', 'INFO');
        }

        else if (row.QCStateLabel == "Started" && !row.depriveStartTime){
            EHR.Server.Utils.addError(scriptErrors, 'depriveStartTime', 'Need to enter a start time to start food deprive', 'ERROR');

        }

    }

    if ((row.schedule == "noon" || row.schedule == "night") && !row.remarks){
        EHR.Server.Utils.addError(scriptErrors, 'remarks', 'Must enter remarks with special arrangements for NOON or NIGHT food deprives', 'ERROR');
    }
    if (oldRow && oldRow.QCStateLabel == 'Started' )
    {
        if ((row.QCStateLabel == 'In Progress' || row.QCStateLabel == 'Completed') && !row.restoredTime)
        {
            EHR.Server.Utils.addError(scriptErrors, 'restoredTime', 'Need to enter a restore time to submit completed food deprive', 'ERROR');

        }
    }

    //test if statement remove once in production. Only allow request for animal in WMIR or A2
    if (row.id && row.QCStateLabel == 'Scheduled' ){


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
    //TODO: need to set description for every field
    console.log ("call setDescription");
    var description = new Array();

    if(row.type)
        description.push('Type: ' + EHR.Server.Utils.nullToString(row.type));

    if(row.amount)
        description.push('Amount: ' + EHR.Server.Utils.nullToString(row.amount));

    if (row.protocolContact)
        description.push('Protocol Contact');

    if (row.id)
        description.push('Id: ' + EHR.Server.Utils.nullToString(row.id));

    if (row.date)
        description.push('Date: ' + EHR.Server.Utils.nullToString(row.date));

    return description;
}
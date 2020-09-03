
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
            EHR.Server.Utils.addError(scriptErrors, 'date', 'Cannot request same day food deprives.', 'INFO');
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

}
function beforeUpdate(row, oldRow, scriptErrors){
    if (row.QCStateLabel=='Started' && oldRow.QCStateLabel=='Scheduled' && !row.depriveStartTime && !row.depriveStartedBy) {
        EHR.Server.Utils.addError(scriptErrors, 'depriveStartTime', 'Need to enter a start time to start food deprive', 'ERROR');
        EHR.Server.Utils.addError(scriptErrors, 'depriveStartedBy', 'Need to enter a initials to start food deprive', 'ERROR');
    }

    if (row.QCStateLabel=='Complete' && oldRow.QCStateLabel=='Started' && (row.depriveStartTime > row.restoredTime)){
        EHR.Server.Utils.addError(scriptErrors, 'restoredTime', 'Restore time must be after than start time', 'ERROR');
    }
}
function afterInsert(row, errors){
    var requestid=row.requestId;
    var id = row.id;
    var project = row.project;

    //WNPRC.Utils.getJavaHelper().sendHusbandryNotification(requestid, id, project);

}

function setDescription(row, helper){
    var description = new Array();

    if(row.reason)
        description.push('Reason: ' + EHR.Server.Utils.nullToString(row.reason));
    if(row.remarks)
        description.push('Remarks: ' + EHR.Server.Utils.nullToString(row.remarks));
    if (row.protocolContact)
        description.push('Protocol Contact: ' + EHR.Server.Utils.nullToString(row.protocolContact));
    if(row.depriveStartedBy)
        description.push('Started by: ' + EHR.Server.Utils.nullToString(row.depriveStartedBy));
    if (row.depriveStartTime)
        description.push('Start Time: ' + EHR.Server.Utils.nullToString(row.depriveStartTime));
    if (row.foodRestoredBy)
        description.push('Restore by: ' + EHR.Server.Utils.nullToString(row.foodRestoredBy));
    if (row.restoredTime)
        description.push('Restore Time: ' + EHR.Server.Utils.nullToString(row.restoredTime));

    return description;
}
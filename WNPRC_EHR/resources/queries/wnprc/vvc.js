var console = require("console");
var LABKEY = require("labkey");
require("ehr/triggers").initScript(this);
EHR.Server.Utils = require("ehr/utils").EHR.Server.Utils;

var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

var vvcUpdate = [];


function onInit(event, helper){
    helper.registerRowProcessor(function(helper, row) {
        if (!row)
            return;

        if (!row.requestId || !row.protocol)
        {
            return;
        }
    })

}

function beforeInsert(row, errors){
    if (this.extraContext.targetQC) {
        row.QCStateLabel = this.extraContext.targetQC;
    }
}
function beforeUpdate(row, oldRow, errors){
    if (this.extraContext.targetQC) {
        row.QCStateLabel = this.extraContext.targetQC;
    }
    console.log("targetQC "+this.extraContext.targetQC);
    if (this.extraContext.targetQC == "Request: Approved"){
        row.daterequested = new Date();
    }
    if (row.QCStateLabel=="Request: Approved" && oldRow.QCStateLabel == "Request: Pending")
    {
        console.log ("new date for date requested ");
        row.daterequested = new Date();
    }

}

function onComplete(event,errors, helper){

    //TODO: for loop to allow for multiple vvc to change status
    //TODO: check target status or QCstate of row to determine the status of the request
    var vvcrows = helper.getRows();
    console.log("**requestId  "+vvcrows[0].row.requestId+ " row.protocol "+ vvcrows[0].row.protocol);
    console.log("QC state "+ vvcrows[0].row.QCStateLabel );

    if (vvcrows[0].row.QCStateLabel == "Request: Approved" && vvcrows[0].row.requestId ){
        console.log ("enter if and save daterequested");
        var currentTime = new Date();
        var completedRequestid = vvcrows[0].row.rowid;
        console.log ("rowid from client "+ vvcrows[0].row.rowid);

        var obj = {
            rowid: vvcrows[0].row.rowid,
            requestid: completedRequestid,
            daterequested: currentTime
        };

        /*LABKEY.Query.selectRows({
            schemaName: 'wnprc',
            queryName: 'vvc',
            filterArray: [
                LABKEY.Filter.create('rowid', completedRequestid, LABKEY.Filter.Types.EQUAL)
            ],
            success: function(data){
                if(data && data.rows && data.rows.length){
                   // obj.rowid = data.rows[0].rowid;
                    LABKEY.Query.updateRows({
                        schemaName: 'wnprc',
                        queryName: 'vvc',
                        scope: this,
                        rows: [obj],
                        success: function(data){
                            console.log('Success updating vvc for '+vvcrows[0].row.protocol)
                        },
                        failure: EHR.Server.Utils.onFailure
                    });
                }
            },
            failure: EHR.Server.Utils.onFailure
        });*/
        //vvcRow.set('dateresquested', currentTime);
        /*vvcUpdate.push ({
            protocol: vvcrows[0].row.protocol,
            daterequested : vvcrows[0].row.date
        })
        WNPRC.Utils.getJavaHelper().updateVVC(vvcUpdate);*/
    }
    //if (vvcrows[0].row.requestId){
    /*if (vvcrows[0].row.requestId && vvcrows[0].row.QCStateLabel  == "Completed"){
        console.log ("enter if statement");
        var requestsCompleted = vvcrows[0].row.requestId;
        var request = [];
        request.push(requestsCompleted);
        //helper.getJavaHelper().processCompletedRequests(request);
        //helper.addRequestModified(row.requestId, row, row.QCStateLabel, (oldRow ? oldRow.QCStateLabel : null));
    }*/

    /*
    if (vvcrows[0].row.QCStateLabel == "Request: Pending" && vvcrows[0].row.requestId){
        var requestid = vvcrows[0].row.requestId;
        console.log ("new request submitted "+ requestid);
        WNPRC.Utils.getJavaHelper().sendVvcNotification(requestid);
    }*/

}
function afterInsert(row, errors){
    //var vvcrows = helper.getRows();

    if (row.QCStateLabel == "Request: Pending" && row.requestId){
        var requestid = row.requestId;
        var hostName = 'https://' + LABKEY.serverName;
        console.log ("new request submitted "+ requestid);
        WNPRC.Utils.getJavaHelper().sendVvcNotification(requestid, hostName);


    }

}
/*
if (_helper.getTargetQCStateLabel() && _helper.getEvent() != 'delete'){
    row.QCStateLabel = _helper.getTargetQCStateLabel();
}*/

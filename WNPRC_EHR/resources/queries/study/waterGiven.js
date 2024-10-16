require("ehr/triggers").initScript(this);
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

//EHR.Server.Utils = require("ehr/utils").EHR.Server.Utils;

function onInit(event, helper){
    //This extracontext is used in the Water Orders form
    helper.decodeExtraContextProperty('waterInTransaction');
    //This extracontext  is used in the Lab Water form
    helper.decodeExtraContextProperty('waterInForm');

    helper.setScriptOptions({
        allowDeadIds: true,
        allowAnyId: true,
        skipIdFormatCheck: true,
        allowFutureDates: true,
        isSkipAssignmentCheck: true
    });

    helper.registerRowProcessor(function(helper, row){
        if (!row)
            return;

        if (!row.Id || !row.date){
            return;
        }
        if (row.taskid){

        }

        var waterInTransaction = helper.getProperty('waterInTransaction');
        waterInTransaction = waterInTransaction || [];
        waterInTransaction[row.Id] = waterInTransaction[row.Id] || [];

        var waterInForm = helper.getProperty('waterInForm');
        waterInForm = waterInForm || {};
        waterInForm[row.Id] = waterInForm[row.Id] || [];

        if (row.objectid)
        {
            var shouldAdd = true;
            LABKEY.ExtAdapter.each(waterInTransaction[row.Id], function (r){
                if (r.objectid == row.objectid){
                    if (r.volume != row.volume){
                        r.volume = row.volume;
                    }
                    else {
                        shouldAdd = false;
                        return;
                    }
                }

            }, this);

            LABKEY.ExtAdapter.each(waterInForm[row.Id], function(r){
                if (r.objectid == row.objectid){
                    if(r.volume != row.volume){
                        r.volume = row.volume;
                    }
                    else{
                        return false;
                    }
                }
            }, this)
        }

        if (shouldAdd){
            waterInTransaction[row.Id].push({
                objectid:       row.objectid,
                date:           row.date,
                datasource:     row.datasource,
                qcstate:        row.qcstate,
                assignedto:     row.assignedto,
                parentid:       row.parentid,
                volume:         row.volume,
                lsid:           row.lsid,
                treatmentId:    row.treatmentId

            });
        }

        helper.setProperty('waterInForm',waterInForm);
        helper.setProperty('waterInTransaction', waterInTransaction);
    });
}

function onUpsert(helper, scriptErrors, row, oldRow) {
    /*if (row.volume == null){
        EHR.Server.Utils.addError(scriptErrors, 'volume', 'This field is required', 'WARN');
        console.log ("value of QCState "+ row.QCState)
    }*/

    if (row.QCStateLabel == 'Scheduled'){
        EHR.Server.Validation.verifyDate(row, scriptErrors, helper);
    }

        if (row.Id && row.date)
        {
            // volume is handled differently for requestsvs actual draws
            var errorQC = 'ERROR';
            //if (EHR.Server.Security.getQCStateByLabel(row.QCStateLabel)['isRequest'] && !row.taskid)
            //    errorQC = 'ERROR';
            //else
            //    errorQC = 'INFO';

            var map = helper.getProperty('waterInTransaction');
            var waters = [];
            if (map && map[row.Id])
            {
                waters = map[row.Id];
                /*for (var i=0;i<map.length; i++ ){
                    console.log ('value of map '+ map[i]);
                    waters.push (map[i]);
                    console.log ("map in JS "+map[i].objectid + " " + map[i].volume);
                }*/
                //console.log("stablishing map "+ map);
               // waters.push(map);
            }
            if (row.location=='laboratory'){
                if (!row.restraint){
                    EHR.Server.Utils.addError(scriptErrors, 'restraint', "Must add restraint", errorQC)
                }
                if (!row.room){
                    EHR.Server.Utils.addError(scriptErrors, 'room', "Must add room", errorQC)
                }
                if (row.weight){
                    helper.getJavaHelper().insertWeight(row.Id, row.date,row.weight);
                }


            }
            if (row.QCStateLabel=='Completed' && !row.performedby){
                    EHR.Server.Utils.addError(scriptErrors, 'performedby', "Must add Performed By", errorQC)
            }


            //TODO: Troubleshoot this function to determine if the animal has not gotten enough water for the last three days.
            /*if (row.volume)
                {
                    var msg = WNPRC.Utils.getJavaHelper().waterLastThreeDays(row.Id, row.date, waters);
                    if (msg != null){
                        EHR.Server.Utils.addError(scriptErrors, 'volume', msg, 'INFO');
                        //EHR.Server.Utils.addError(scriptErrors, 'quantity', msg, errorQC);
                    }

                }*/
            console.log ("value of treatmentId "+ row.treatmentId + (row.treatmentId == null));

            //This validation should only be called when using the Lab Water from, when entering

            if (row.volume && !row.treatmentId && !row.skipWaterRegulationCheck){
                var map = helper.getProperty('waterInForm');
                var waterInForm = [];
                if (map && map[row.Id]){
                    waterInForm = map[row.Id];
                }
                let jsonArray = WNPRC.Utils.getJavaHelper().checkWaterSchedule(row.Id,row.date,row.objectid,row.volume,waterInForm);
                if (jsonArray != null){
                    for (var i = 0; i < jsonArray.length; i++ ){
                        let errorObject = jsonArray[i];
                        EHR.Server.Utils.addError(scriptErrors,errorObject.field, errorObject.message,errorObject.severity);

                    }
                }

            }


        }
        console.log ('parentid '+ row.parentid + ' lsid: '+row.lsid);
        if (row.id && row.date && row.performedby && row.parentid && !row.lsid){
            console.log ('parentid '+ row.parentid);
            WNPRC.Utils.WNPRC.Utils.getJavaHelper().updateWaterRow(row.performedby, row.parentid);
        }

        console.log("value of qcstate water given"+ row.QCStateLabel+ "  QCState Using Secuirty "+ EHR.Server.Security.getQCState(row)['isPublicData']);
        if (row.QCStateLabel=='Completed'){
            console.log ("one record completed "+ row.Id);
           // row.QCState = 1;

        }
        if (row.waterSource == 'lixit' && !row.remarks){
            EHR.Server.Utils.addError(scriptErrors, 'remarks', 'Add remark for connecting lixit', 'WARN');
        }

        if (row.treatmentId != null && row.id && row.performedby && row.volume != null && (row.QCStateLabel == 'In Progress' || row.QCStateLabel == 'Completed')){

            let errorMessage = WNPRC.Utils.getJavaHelper().changeWaterAmountQC(row.treatmentId, waters);
            console.log('error Message ' + errorMessage);
            if (!errorMessage){
                console.log('before adding description '+ row);
                if (waters[0].waterObjects){
                    addWaterGivenDescription(row, waters);
                }

            }
        }


        //EHR.Server.Validation.checkRestraint(row, scriptErrors);

}
function addWaterGivenDescription(row, waters){
    let clientDescription = '';
    let waterRecords = [];
    waterRecords = waters[0].waterObjects;
    for (var i=0;i<waterRecords.length; i++ ){
        let waterRecord = waterRecords[i];
        clientDescription += 'Volume of ' + + waterRecord.volume + ' assigned to ' +waterRecord.assignedTo;

        if ( i < waterRecords.length-1){
            clientDescription += '\n';
        }
    }
    row.clientDescription = clientDescription;
}

function setDescription(row, helper){
    var description = new Array();

    if (row.clientDescription)
        description.push(EHR.Server.Utils.nullToString(row.clientDescription));
    if (row.volume)
        description.push('Total Volume: ' +EHR.Server.Utils.nullToString(row.volume));
    if (row.provideFruit)
        description.push('Provide Fruit: ' +EHR.Server.Utils.nullToString(row.provideFruit));
    if (row.remarks)
        description.push('Remarks: ' +EHR.Server.Utils.nullToString(row.remarks));

    return description;

}
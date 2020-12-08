require("ehr/triggers").initScript(this);
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

//EHR.Server.Utils = require("ehr/utils").EHR.Server.Utils;

function onInit(event, helper){
   // helper.decodeExtraContextProperty('waterInTransaction');

    helper.setScriptOptions({
        allowDeadIds: true,
        allowAnyId: true,
        skipIdFormatCheck: true,
        allowFutureDates: true,
        isSkipAssignmentCheck: true
    });

    /*helper.registerRowProcessor(function(helper, row){
        if (!row)
            return;

        if (!row.Id || !row.date){
            return;
        }
        if (row.taskid){

        }

        var waterInTransaction = helper.getProperty('waterInTransaction');
        waterInTransaction = waterInTransaction || [];
        console.log ('size of water in Transaction '+ waterInTransaction);
        //waterInTransaction[] = waterInTransaction[] || [];
        console.log ('water in Transaction '+ waterInTransaction[0]);

        console.log ("registering rows "+ row.Id );

        if (row.objectid)
        {
            var shouldAdd = true;
            LABKEY.ExtAdapter.each(waterInTransaction[row.Id], function (r){
                if (r.objectid == row.objectid){
                    if (r.quantity != row.quantity){
                        r.quantity = row.quantity;
                    }
                    else {
                        shouldAdd = false;
                        return;
                    }
                }
               // i++

            }, this);
        }
        if (shouldAdd){
            /!*waterInTransaction[row.Id].push({
                objectid: row.objectid,
                date: row.date,
                qcstate: row.qcstate,
                assignto: row.assignto,
                parentid: row.parentid,
                volume: row.volume,
                lsid: row.lsid

            });*!/
            //console.log (i+' inside loop water in Transaction '+ waterInTransaction[i].date+ ' '+ waterInTransaction[i].Id +' '+ waterInTransaction[i].assignto);
            //console.log (waterInTransaction[i].objectid+ ' '+waterInTransaction[i].volume);
        }




        helper.setProperty('waterInTransaction', waterInTransaction);
    });*/
}

function onUpsert(helper, scriptErrors, row, oldRow) {
    /*if (row.volume == null){
        EHR.Server.Utils.addError(scriptErrors, 'volume', 'This field is required', 'WARN');
        console.log ("value of QCState "+ row.QCState)
    }*/

    if (row.QCStateLabel == 'Scheduled'){
        console.log ("value of date "+ row.date);
        EHR.Server.Validation.verifyDate(row, scriptErrors, helper);

        /*if(row.QCStateLabel == 'Scheduled'){
            //TODO: add special condition for water given
            currentTimeRounded.setHours(13,30,0,0);
            console.log ('RowTime at 1:30 PM '+currentTimeRounded);
            console.log ('Rowtime '+ date);
            if (date>currentTimeRounded){
                EHR.Server.Utils.addError(errors, 'date', 'Cannot schedule water after 13:30 PM', 'ERROR');
            }

        }*/
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

            //TODO: move validation to water amount to make sure not PN waters are requested after 1:30PM
            /*var msg = WNPRC.Utils.getJavaHelper().checkScheduledWaterTask(waters);
            if (msg != null){
                EHR.Server.Utils.addError(scriptErrors, 'date', msg, errorQC);
                //EHR.Server.Utils.addError(scriptErrors, 'quantity', msg, errorQC);
            }*/

            if (row.volume)
                {
                    var msg = WNPRC.Utils.getJavaHelper().waterLastThreeDays(row.Id, row.date, waters);
                    if (msg != null){
                        EHR.Server.Utils.addError(scriptErrors, 'volume', msg, 'INFO');
                        //EHR.Server.Utils.addError(scriptErrors, 'quantity', msg, errorQC);
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


        //EHR.Server.Validation.checkRestraint(row, scriptErrors);


}

function setDescription(row, helper){
    var description = new Array();

    if (row.volume)
        description.push('Volume: ' +EHR.Server.Utils.nullToString(row.volume));
    if (row.provideFruit)
        description.push('Provide Fruit: ' +EHR.Server.Utils.nullToString(row.provideFruit));
    if (row.remarks)
        description.push('Remarks: ' +EHR.Server.Utils.nullToString(row.remarks));

    return description;

}
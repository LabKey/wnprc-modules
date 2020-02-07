require("ehr/triggers").initScript(this);

//EHR.Server.Utils = require("ehr/utils").EHR.Server.Utils;

function onInit(event, helper){
    helper.setScriptOptions({
        allowDeadIds: true,
        allowAnyId: true,
        skipIdFormatCheck: true,
        allowFutureDates: true
    });
}

function onUpsert(helper, scriptErrors, row, oldRow) {
    if (!row.amount){
        EHR.Server.Utils.addError(scriptErrors, 'amount', 'This field is required amount', 'WARN');
        console.log ("value of QCState "+ row.QCState)
    }

    console.log ("value of date "+ row.code);
    if (row.code != 'c-10120'){
        console.log ("value of date "+ row.code);
        EHR.Server.Utils.addError(scriptErrors, 'code', 'This field is required amount', 'WARN');
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

    if (!helper.isETL()){
        console.log("value of qcstate "+ row.QCStateLabel+ "  QCState Using Secuirty "+ EHR.Server.Security.getQCState(row)['isPublicData']);
        if (row.QCStateLabel=='Completed'){
            console.log ("one record completed "+ row.Id);
            row.QCState = 1;

        }


        EHR.Server.Validation.checkRestraint(row, scriptErrors);

    }
}
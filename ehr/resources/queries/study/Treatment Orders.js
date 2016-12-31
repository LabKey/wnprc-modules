/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInit(event, helper){
    helper.setScriptOptions({
        allowFutureDates: true
    });
}

function onUpsert(helper, scriptErrors, row, oldRow){
    if (!helper.isETL()){
        if (row.volume && row.concentration){
            var expected = Math.round(row.volume * row.concentration * 1000) / 1000;
            if (Math.abs(row.amount - expected) > 0.2){ //allow for rounding
                EHR.Server.Utils.addError(scriptErrors, 'amount', 'Amount does not match volume for this concentration. Expected: '+expected, 'WARN');
                //EHR.Server.Utils.addError(scriptErrors, 'volume', 'Volume does not match amount for this concentration. Expected: '+expected, 'WARN');
            }
        }
    }
}
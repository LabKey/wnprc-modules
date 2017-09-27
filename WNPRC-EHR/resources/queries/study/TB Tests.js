/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInit(event, helper){
    helper.setScriptOptions({
        removeTimeFromDate: true
    });
}

function setDescription(row, helper){
    //we need to set description for every field
    var description = new Array();

    if(row.eye)
        description.push('Eye: '+row.eye);
    if(row.lot)
        description.push('Lot: '+row.lot);
    if(row.dilution)
        description.push('Dilution: '+row.dilution);
    if(typeof(row.result1)!==undefined)
        description.push('24H: '+row.result1);
    if(typeof(row.result2)!==undefined)
        description.push('48H: '+row.result2);
    if(typeof(row.result3)!==undefined)
        description.push('72H: '+row.result3);

    return description;
}

function onUpsert(helper, scriptErrors, row, oldRow){
    if (!row.notPerformedAtCenter && (row.result1=='' || row.result2=='' || row.result3=='' || row.result1==null || row.result2==null || row.result3==null)){
        row.missingResults = true;
    }
    else {
        row.missingResults = false
    }
}
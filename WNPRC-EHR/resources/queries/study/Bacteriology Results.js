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

    if (row.source)
        description.push('Source: '+EHR.Server.Utils.snomedToString(row.source,  row.sourceMeaning, helper));
    if (row.method)
        description.push('Method: '+row.method);

    if (row.organism)
        description.push('Organism: '+EHR.Server.Utils.snomedToString(row.organism,  row.resultMeaning, helper));
    if(row.result)
        description.push('Result: '+EHR.Server.Utils.nullToString(row.result)+' '+EHR.Server.Utils.nullToString(row.units));
    if(row.qualResult)
        description.push('Qual Result: '+EHR.Server.Utils.nullToString(row.qualResult));

    if (row.antibiotic)
        description.push('Antibiotic: '+EHR.Server.Utils.snomedToString(row.antibiotic, row.antibioticMeaning, helper));

    if (row.sensitivity)
        description.push('Sensitivity: ' + row.sensitivity);

    return description;
}

function onUpsert(helper, scriptErrors, row, oldRow){
    if (row.sensitivity && row.antibiotic == null){
        EHR.Server.Utils.addError(scriptErrors, 'sensitivity', "Must provide an antibiotic to go with sensitivity", 'WARN');
    }
}

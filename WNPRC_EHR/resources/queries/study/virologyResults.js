/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
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
        description.push('Source: '+row.source);

    if (row.testid)
        description.push('Test: '+row.testid);
    if (row.virus)
        description.push('Test: '+row.virus);
    if (row.virusCode)
        description.push('Virus: '+EHR.Server.Utils.snomedToString(row.virusCode,  row.virusMeaning, helper));

    if (row.method)
        description.push('Method: '+row.method);
    if (row.sampleType)
        description.push('Sample Type: '+EHR.Server.Utils.snomedToString(row.sampleType,  row.sampleMeaning, helper));

    if(row.result)
        description.push('Result: '+EHR.Server.Utils.nullToString(row.result)+' '+EHR.Server.Utils.nullToString(row.units));
    if(row.qualResult)
        description.push('Qual Result: '+EHR.Server.Utils.nullToString(row.qualResult));

    return description;
}


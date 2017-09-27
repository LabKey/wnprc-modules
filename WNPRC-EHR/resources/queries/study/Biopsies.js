/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInit(event, helper){
    helper.setScriptOptions({
        allowAnyId: true,
        allowDeadIds: true
    });
}

function setDescription(row, helper){
    //we need to set description for every field
    var description = new Array();

    if(row.caseno)
        description.push('Case No: '+EHR.Server.Utils.nullToString(row.caseno));
    if(row.type)
        description.push('Type: '+EHR.Server.Utils.nullToString(row.type));
    if(row.veterinarian)
        description.push('Veterinarian: '+EHR.Server.Utils.nullToString(row.veterinarian));
    if(row.nhpbmd)
        description.push('NHPBMD?: '+EHR.Server.Utils.nullToString(row.nhpbmd));

    return description;
}

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

    if(row.testid)
         description.push('Test: '+EHR.Server.Utils.nullToString(row.testid));
    if (row.method)
        description.push('Method: '+row.method);

    if(row.result)
        description.push('Result: '+EHR.Server.Utils.nullToString(row.result)+' '+EHR.Server.Utils.nullToString(row.units));
    if(row.qualResult)
        description.push('Qual Result: '+EHR.Server.Utils.nullToString(row.qualResult));

    return description;
}

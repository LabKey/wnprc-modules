/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInit(event, context){
    context.allowDeadIds = true;
}

function setDescription(row, helper){
    //we need to set description for every field
    var description = new Array();

    if (row.tissue)
        description.push('Tissue: '+EHR.Server.Utils.snomedToString(row.tissue, null, helper));
    if (row.severity)
        description.push('Severity: '+EHR.Server.Utils.snomedToString(row.severity, null, helper));
    if (row.duration)
        description.push('Duration: '+EHR.Server.Utils.snomedToString(row.duration, null, helper));
    if (row.distribution)
        description.push('Distribution: '+EHR.Server.Utils.snomedToString(row.distribution, null, helper));
    if (row.distribution2)
        description.push('Distribution: '+EHR.Server.Utils.snomedToString(row.distribution2, null, helper));
    if (row.inflammation)
        description.push('Inflammation: '+EHR.Server.Utils.snomedToString(row.inflammation, null, helper));
    if (row.inflammation2)
        description.push('Inflammation: '+EHR.Server.Utils.snomedToString(row.inflammation2, null, helper));
    if (row.etiology)
        description.push('Etiology: '+EHR.Server.Utils.snomedToString(row.etiology, null, helper));
    if (row.process)
        description.push('Process: '+EHR.Server.Utils.snomedToString(row.process, null, helper));

    return description;
}

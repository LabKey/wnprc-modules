/*
 * Copyright (c) 2011-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onUpsert(scriptContext, errors, row, oldRow){
    //make sure the anmimal is female
    if(row.id)
        EHR.Server.Validation.verifyIsFemale(row, errors, scriptContext);
}

function setDescription(row, helper){
    //we need to set description for every field
    var description = new Array();

    if(row.method)
        description.push('Method: '+row.method);

    description.push('Is Pregnant: '+row.isPregnant);

    if(row.conception)
        description.push('Conception: '+row.conception);
    if(row.sire)
        description.push('Sire: '+row.sire);

    return description;
}
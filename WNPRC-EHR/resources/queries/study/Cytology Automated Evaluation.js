/*
 * Copyright (c) 2012-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
require("ehr/triggers").initScript(this);

function onInit(event, helper){
    helper.setScriptOptions({
        removeTimeFromDate: true
    });
}

function onETL(row, errors){
    if(row.stringResults){
        EHR.ETL.fixChemValue(row, errors);
    }
}

function setDescription(row, helper){
    //we need to set description for every field
    var description = new Array();

    if(row.testid)
        description.push('Test: '+EHR.Server.Utils.nullToString(row.testid));
    if (row.method)
        description.push('Method: '+row.method);
    if (row.units) 
		description.push('Units: '+row.units);
    if(row.result)
        description.push('Result: '+EHR.Server.Utils.nullToString(row.result));
   
    return description;
}
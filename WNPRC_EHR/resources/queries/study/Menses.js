/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
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
    return [];//["Interval: "+row.interval];
}


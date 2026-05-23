/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInit(event, scriptContext){
     scriptContext.quickValidation = true;
}

function setDescription(row, helper){
    var description = ['Cage Observation'];

    if(row.feces)
        description.push('Feces: '+row.feces);

    return description;
}

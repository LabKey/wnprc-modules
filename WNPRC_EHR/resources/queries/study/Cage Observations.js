/*
 * Copyright (c) 2010-2014 LabKey Corporation
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

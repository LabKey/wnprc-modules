/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInit(event, helper){
    helper.setScriptOptions({
        removeTimeFromDate: false
    });
}

function setDescription(row, helper){
    //we need to set description for every field
    var description = new Array();

    if(row.morphology)
        description.push('Morphology: '+ row.morphology);
    if(row.severity)
        description.push('Serverity: '+ row.severity);
    if(row.score)
        description.push('Score: '+ row.score);


    return description;
}
/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onUpsert(context, errors, row, oldRow){
    if(!row.behavior && !row.performedby){
        EHR.Server.Utils.addError(errors, 'behavior', 'Must enter at least one comment', 'WARN');
        EHR.Server.Utils.addError(errors, 'performedby', 'Must enter your intials', 'WARN')


    }
    //row.userid = ;
   /* if (row.id && row.category){
        EHR.Server.Validation.checkBehavior(row,errors,context, 'category');

    }*/
}

function setDescription(row, helper){
    //we need to set description for every field
    var description = new Array();

    if (row.behavior)
        description.push('Behavior: : '+row.behavior);

    if (row.performedby)
        description.push('Performedby: '+row.performedby)


    return description;
}


/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInit(event, helper){
    helper.setScriptOptions({
        allowDeadIds: true
    });
}

function onUpsert(helper, scriptErrors, row, oldRow){
    //NOTE: each center has slightly different names on the SOAP fields.  this check tests all, and should not get in the way of either
    if(!row.hx && !row.so && !row.s && !row.p2 && !row.o && !row.a && !row.p && !row.remark){
        EHR.Server.Utils.addError(scriptErrors, 'remark', 'Must enter at least one comment', 'WARN');
        EHR.Server.Utils.addError(scriptErrors, 'so', 'Must enter at least one comment', 'WARN');
        EHR.Server.Utils.addError(scriptErrors, 's', 'Must enter at least one comment', 'WARN');
    }

    //for compatibility with old system
    row.userid = row.performedby;

}

function setDescription(row, helper){
    //we need to set description for every field
    var description = new Array();

    if (row.hx)
        description.push('Hx: '+row.hx);
    if (row.so)
        description.push('S/O: '+row.so);
    if (row.s)
        description.push('S: '+row.s);
    if (row.o)
        description.push('O: '+row.o);
    if (row.a)
        description.push('A: '+row.a);
    if (row.p)
        description.push('P: '+row.p);
    if (row.p2)
        description.push('P2: '+row.p2);

    return description;
}

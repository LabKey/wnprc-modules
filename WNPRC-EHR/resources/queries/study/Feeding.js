/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onUpsert(helper, scriptErrors, row, oldRow){
    row.date = new Date();
}

function setDescription(row, helper){
    //we need to set description for every field
    var description = new Array();

    if(row.type)
        description.push('Type: ' + EHR.Server.Utils.nullToString(row.type));

    if(row.amount)
        description.push('Amount: ' + EHR.Server.Utils.nullToString(row.amount));

    return description;
}


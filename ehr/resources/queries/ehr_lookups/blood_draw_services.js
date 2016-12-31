/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


var console = require("console");
var LABKEY = require("labkey");

var triggerHelper = org.labkey.ehr.utils.TriggerScriptHelper.create(LABKEY.Security.currentUser.id, LABKEY.Security.currentContainer.id);

function beforeUpdate(row, oldRow, errors) {
    console.log ("calling beforeUpdate");
    triggerHelper.clearLabworkServicesCache();
}
function afterUpdate(row){
    console.log ("calling afterUpdate");
    triggerHelper.clearLabworkServicesCache();
}

function afterInsert(row){
    triggerHelper.clearLabworkServicesCache();
}

function afterDelete(row){
    triggerHelper.clearLabworkServicesCache();
}
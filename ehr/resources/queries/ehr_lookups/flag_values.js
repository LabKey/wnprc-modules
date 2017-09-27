/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var LABKEY = require("labkey");
var helper = org.labkey.ehr.utils.TriggerScriptHelper.create(LABKEY.Security.currentUser.id, LABKEY.Security.currentContainer.id);

console.log("** evaluating: " + this['javax.script.filename']);

function beforeInsert(row, errors) {
    row.code = row.code || helper.getNextFlagCode();
    row.objectid = row.objectid || LABKEY.Utils.generateUUID().toUpperCase();
}
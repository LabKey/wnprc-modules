/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var LABKEY = require("labkey");
var helper = org.labkey.ldk.query.LookupValidationHelper.create(LABKEY.Security.currentContainer.id, LABKEY.Security.currentUser.id, 'ehr_lookups', 'rooms');

function afterUpdate(row, oldRow, errors){
    //cascade update cage table
    if (row.room && oldRow.room && row.room != oldRow.room){
        helper.cascadeUpdate('ehr_lookups', 'cage', 'room', row.room, oldRow.room);
    }
}
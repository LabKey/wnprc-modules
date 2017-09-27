/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var LABKEY = require("labkey");

var helper = org.labkey.ldk.query.LookupValidationHelper.create(LABKEY.Security.currentContainer.id, LABKEY.Security.currentUser.id, 'ehr_lookups', 'procedures');


function beforeDelete(row, errors){
    if (helper.verifyNotUsed('study', 'encounters', 'procedureid', row['rowid'])){
        addError(errors, 'name', 'Cannot delete row with ID: ' + row['rowid'] + ' because it is referenced by the table encounters.  You should inactivate this item instead.');
    }
}

function addError(errors, fieldName, msg){
    if (!errors[fieldName])
        errors[fieldName] = [];

    errors[fieldName].push(msg);
}

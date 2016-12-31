/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

var constraintHelper = org.labkey.ldk.query.UniqueConstraintHelper.create(LABKEY.Security.currentContainer.id, LABKEY.Security.currentUser.id, 'ehr', 'project', 'name');

EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.BEFORE_UPSERT, 'ehr', 'project', function(helper, scriptErrors, row, oldRow){
    //enforce name unique
    if (row.name){
        var isValid = constraintHelper.validateKey(row.name, oldRow ? (oldRow.name || null) : null);
        if (!isValid){
            EHR.Server.Utils.addError(scriptErrors, 'name', 'There is already a project with the name: ' + row.name, 'ERROR');
        }
    }
});

EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.AFTER_UPSERT, 'ehr', 'project', function(helper, errors, row, oldRow){
    if (row.project && !helper.isValidateOnly()){
        helper.getJavaHelper().updateCachedProtocol(row.project, row.protocol);
    }
});
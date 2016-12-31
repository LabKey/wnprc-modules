/*
 * Copyright (c) 2012-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.AFTER_UPSERT, 'study', 'Cases', function(helper, errors, row, oldRow){
    if (!helper.isValidateOnly() && !helper.isETL() && row.enddate && row.objectid){
        //we want to capture newly inserted records that are ended, or updates that set an enddate
        if (!oldRow || !oldRow.enddate){
            helper.getJavaHelper().closeActiveProblemsForCase(row.id, row.enddate, row.objectid);
        }

        //cascade update linked problems if ID changes:
        if (oldRow && oldRow.Id != row.Id && row.objectid){
            helper.getJavaHelper().updateProblemsFromCase(row.Id, oldRow.Id, row.objectid);
        }
    }
});

EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.BEFORE_UPSERT, 'study', 'Cases', function(helper, errors, row, oldRow){
    //the objective is to null out the review date if there is an enddate for this case
    if (!helper.isValidateOnly() && !helper.isETL() && row.enddate && row.reviewdate){
        row.reviewdate = null;
    }
});

EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.AFTER_DELETE, 'study', 'Cases', function(helper, errors, row, oldRow){
    if (!helper.isValidateOnly() && !helper.isETL() && row.objectid){
        helper.getJavaHelper().deleteProblemsFromCase(row.objectid);
    }
});
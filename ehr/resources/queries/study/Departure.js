/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInit(event, helper){
    helper.setScriptOptions({
        requiresStatusRecalc: true
    });

    helper.decodeExtraContextProperty('departuresInTransaction');

}

EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.ON_BECOME_PUBLIC, 'study', 'Departure', function(scriptErrors, helper, row, oldRow) {
    helper.registerDeparture(row.Id, row.date);

    //this will close any existing assignments, housing and treatment records
    helper.onDeathDeparture(row.Id, row.date);
});
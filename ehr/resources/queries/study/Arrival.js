/*
 * Copyright (c) 2010-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInit(event, helper){
    helper.setScriptOptions({
        allowAnyId: true,
        requiresStatusRecalc: true
    });
}

EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.ON_BECOME_PUBLIC, 'study', 'Arrival', function(scriptErrors, helper, row, oldRow) {
    helper.registerArrival(row.Id, row.date);

    //if not already present, we insert into demographics
    if (!helper.isETL() && !helper.isGeneratedByServer()){
        helper.getJavaHelper().onAnimalArrival(row.id, row);

        //if room provided, we insert into housing
        if (row.initialRoom){
            helper.getJavaHelper().createHousingRecord(row.Id, row.date, null, row.initialRoom, (row.initialCage || null), (row.initialCond || null));
        }
    }
});
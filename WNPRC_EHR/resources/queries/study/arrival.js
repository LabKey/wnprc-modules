/*
 * Copyright (c) 2010-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);
var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

function onInit(event, helper){
    helper.setScriptOptions({
        allowAnyId: true,
        requiresStatusRecalc: true
    });
}



function onUpsert(helper, scriptErrors, row, oldRow) {

    //check for other arrival records to see if entered vendor id matches previous vendor ids
    if (!!row.vendor_id){
        var vendorIdsObj = WNPRC.Utils.getJavaHelper().checkOldVendorIds(row.objectid, row.Id, row.vendor_id);
        var vendorIdsArray = Object.keys(vendorIdsObj).map(function(_) { return vendorIdsObj[_]; })
        var uniqueVendorIds = WNPRC.Utils.uniqueArray(vendorIdsArray);
        if (uniqueVendorIds.length > 0){
            EHR.Server.Utils.addError(scriptErrors, 'vendor_id', 'This vendor id does not match ' + vendorIdsArray.length + ' record(s) of that have vendor id(s) ' + uniqueVendorIds.join(';') , 'WARN');
        }
    }
}

EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.ON_BECOME_PUBLIC, 'study', 'Arrival', function(scriptErrors, helper, row, oldRow) {
    helper.registerArrival(row.Id, row.date);

    //if not already present, we insert into demographics
    if (!helper.isETL() && !helper.isGeneratedByServer()){
        var birthErrors = helper.getJavaHelper().onAnimalArrival(row.id, row, helper.getExtraBirthFieldMappings(), helper.getExtraDemographicsFieldMappings());
        if (birthErrors){
            EHR.Server.Utils.addError(scriptErrors, 'birth', birthErrors, 'ERROR');
        }

        //if room provided, we insert into housing
        if (row.initialRoom){
            helper.getJavaHelper().createHousingRecord(row.Id, row.date, null, row.initialRoom, (row.initialCage || null), (row.initialCond || null));
        }
    }
});
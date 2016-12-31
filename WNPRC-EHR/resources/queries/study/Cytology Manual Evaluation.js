/*
 * Copyright (c) 2012-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


require("ehr/triggers").initScript(this);


function setDescription(row, helper){
    //we need to set description for every field
    var description = new Array();

    if (row.staintype)
        description.push('Stain Type: '+row.staintype);
    if (row.sampletype)
        description.push('Sample Type: '+row.sampletype);

    if (row.sampleappearance)
        description.push('Sample Appearance: '+EHR.Server.Utils.nullToString(row.sampleappearance));
    if (row.slidesmade) 
        description.push('Slides Made: '+(row.slidesMade));
    if (row.slidessubmitted)
    	description.push('Slides Submitted: '+row.slidessubmitted);
    if(row.results)
        description.push('Results: '+EHR.Server.Utils.nullToString(row.results));
    
    return description;
}

function onInit(event, helper){
    helper.setScriptOptions({
        removeTimeFromDate: true
    });
}

function onUpsert(helper, scriptErrors, row, oldRow){
    if ((row.slidesmade != null) && (row.slidessubmitted != null)){
    	if (row.slidesmade < row.slidessubmitted) {
    		console.log("Looking for ...");
        EHR.Server.Utils.addError(scriptErrors, 'slidesSubmitted', "Number of slides submitted must be less than or equal the number of slides made", 'WARN');
    	}
    }
}
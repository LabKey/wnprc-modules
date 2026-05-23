/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

//function onInit(event, context){
//    context.extraContext.allowAnyId = true;
//}

function onUpsert(context, errors, row, oldRow){
    //TODO: do we need this for every ETL record?
    //NOTE: this should be getting set by the birth, death, arrival & departure tables
    if(!row.calculated_status && context.extraContext.dataSource != 'etl'){
        row = EHR.Server.Validation.updateStatusField([row.Id], row);
    }
}

function setDescription(row, helper){
    //we need to set description for every field
    var description = new Array();

    return description;
}

/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onInsert(helper, scriptErrors, row){
    row.duedate = row.duedate || new Date();
}

function onUpsert(helper, scriptErrors, row, oldRow){
    if(row.QCStateLabel && EHR.Server.Security.getQCStateByLabel(row.QCStateLabel).PublicData){
        row.datecompleted = new Date();
    }
}

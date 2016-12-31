/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function onUpsert(helper, scriptErrors, row, oldRow){
    if (!helper.isETL() && row.date && !row.requestdate){
        row.requestdate = row.date;
    }

    EHR.Server.Validation.checkRestraint(row, scriptErrors);
}
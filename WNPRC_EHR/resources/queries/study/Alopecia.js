/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function setDescription(row, helper){
    //we need to set description for every field
    var description = new Array();

    if(row.score)
        description.push('Alopecia Score: ' + EHR.Server.Utils.nullToString(row.score));

    if(row.cause)
        description.push('Cause: ' + EHR.Server.Utils.nullToString(row.cause));

    return description;
}

/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function setDescription(row, helper){
    //we need to set description for every field
    var description = new Array();

    if(row.jaw)
        description.push('Jaw: ' + row.jaw);
    if(row.side)
        description.push('Side: ' + row.side);
    if(row.tooth)
        description.push('Tooth: ' + row.tooth);
    if(row.status)
        description.push('Status: ' + row.status);

    return description;
}
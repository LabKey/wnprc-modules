/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function setDescription(row, helper){
    //we need to set description for every field
    var description = new Array();

    if(row.priority)
        description.push('Priority: ' + row.priority);
    if(row.extractions)
        description.push('Extractions: ' + row.extractions);
    if(row.gingivitis)
        description.push('Gingivitis: ' + row.gingivitis);
    if(row.tartar)
        description.push('Tartar: ' + row.tartar);

    return description;
}
/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function setDescription(row, helper){
    //we need to set description for every field
    var description = new Array();

    var createdby = row.createdby || LABKEY.Security.currentUser.id;

    if (createdby)
        description.push('Created By: '+ EHR.Server.Utils.findPrincipalName(createdby));
    if (row.notify1)
        description.push('Notify 1: '+ EHR.Server.Utils.findPrincipalName(row.notify1));
    if (row.notify2)
        description.push('Notify 2: '+ EHR.Server.Utils.findPrincipalName(row.notify2));
    if (row.notify3)
        description.push('Notify 3: '+ EHR.Server.Utils.findPrincipalName(row.notify3));

    return description;
}
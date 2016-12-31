/*
 * Copyright (c) 2011-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

function setDescription(row, helper){
    //we need to set description for every field
    var description = new Array();

    if(row.type)
        description.push('Type: '+row.type);
    if(row.quantity)
        description.push('Quantity: '+row.quantity);
    if(row.totalCost)
        description.push('Total Cost: '+row.totalCost);

    return description;
}

function onUpsert(helper, scriptErrors, row, oldRow){
    if(row.quantity && row.unitCost)
        row.totalCost = row.unitCost * row.quantity;
    else
        row.totalCost = null;
}
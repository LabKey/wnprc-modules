var WNPRC = require("wnprc_ehr/WNPRC").WNPRC;

require("ehr/triggers").initScript(this);

function onComplete(event, errors, helper) {
    let housingRows = helper.getRows();

    let myarray = [];

    for (let i = 0; i < housingRows.length; i++) {
        if (!housingRows[i].row.enddate) {
            myarray.push(housingRows[i].row);
        }
    }

    if (myarray.length > 0) {
        WNPRC.Utils.getJavaHelper().createBreedingRecordsFromHousingChanges(myarray);
    }
}
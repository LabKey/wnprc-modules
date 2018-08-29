/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

require("ehr/triggers").initScript(this);

var LABKEY = require("labkey");

function onUpsert(helper, scriptErrors, row, oldRow) {
    console.log("chargeable Items row:\n", row);
}

function onComplete(event, errors, helper) {

    var rows = helper.getRows();

    var rowsForChargeRates = [];

    if (rows.length > 0) {

        console.log("Begin inserting " + rows.length + " rows into ehr_billing.chargeRates.");

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i].row;
            var valsToInsert = {
                chargeId: row["rowId"],
                unitCost: row["unitCost"],
                genCredits: row["genCredits"],
                startDate: EHR.Server.Utils.normalizeDate(row.startDate),
                endDate: EHR.Server.Utils.normalizeDate(row.endDate)
            };

            rowsForChargeRates.push(valsToInsert);
        }

        LABKEY.Query.insertRows({
            schemaName: 'ehr_billing',
            queryName: 'chargeRates',
            rows: rowsForChargeRates,
            scope: this,
            success: function (data) {
                console.log("Inserted " + data.rows.length + " rows into ehr_billing.chargeRates.");
            },
            failure: function (error) {
                console.log("Insert rows error for ehr_billing.chargeRates: " + error);
            }
        });
    }
}

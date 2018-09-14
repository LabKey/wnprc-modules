
require("ehr/triggers").initScript(this);

var validItems = [];
var validRates = {};

function onInit(event, helper){

    // Cache saved chargeable items
    LABKEY.Query.selectRows({
        requiredVersion: 9.1,
        schemaName: 'ehr_billing',
        queryName: 'chargeableItems',
        columns: ['rowid, name, departmentCode'],
        scope: this,
        success: function (results) {
            if (!results || !results.rows || results.rows.length < 1)
                return;

            for(var i=0; i<results.rows.length; i++) {
                validItems.push({"rowid":results.rows[i]["rowid"]["value"], "name":results.rows[i]["name"]["value"], "departmentCode":results.rows[i]["departmentCode"]["value"]})
            }
        },
        failure: function (error) {
            console.log(error);
        }
    });

    LABKEY.Query.selectRows({
        requiredVersion: 9.1,
        schemaName: 'ehr_billing',
        queryName: 'chargeRates',
        columns: ['chargeId, startDate, endDate'],
        scope: this,
        success: function (results) {
            if (!results || !results.rows || results.rows.length < 1)
                return;

            for(var i=0; i<results.rows.length; i++) {
                if (!validRates[results.rows[i]["chargeId"]["value"]]) {
                    validRates[results.rows[i]["chargeId"]["value"]] = [];
                }
                validRates[results.rows[i]["chargeId"]["value"]].push({"startDate":results.rows[i]["startDate"]["value"], "endDate":results.rows[i]["endDate"]["value"]})
            }
        },
        failure: function (error) {
            console.log(error);
        }
    });
}

function onUpsert(helper, scriptErrors, row, oldRow) {
    var format = "E MMM dd yyyy";

    if (row.chargeRateEndDate < row.chargeRateStartDate) {
        EHR.Server.Utils.addError(scriptErrors, 'chargeRateEndDate', "For charge Item " + row.name + ": Charge rate start date (" + row.chargeRateStartDate + ") is after charge rate end date (" + row.chargeRateEndDate + ").", 'ERROR');
        return;
    }

    if (row.chargeableItemEndDate < row.chargeableItemStartDate) {
        EHR.Server.Utils.addError(scriptErrors, 'chargeableItemEndDate', "For charge Item " + row.name + ": Charge item start date (" + row.chargeableItemStartDate + ") is after charge item end date (" + row.chargeableItemEndDate + ").", 'ERROR');
        return;
    }

    var isItemUpdate = false;
    for (var i=0; i < validItems.length; i++) {
        if (validItems[i]["name"] === row.name && validItems[i]["departmentCode"] === row.departmentCode) {
            isItemUpdate = true;
            row.chargeId = validItems[i]["rowid"];
            break;
        }
    }

    if (isItemUpdate) {
        var rowStartDate = EHR.Server.Utils.normalizeDate(row.chargeRateStartDate);
        var rowEndDate = EHR.Server.Utils.normalizeDate(row.chargeRateEndDate);
        var savedStartDate, savedEndDate;
        for (var r = 0; r < validRates[row.chargeId].length; r++) {

            // Verify start date not within another range
            savedStartDate = EHR.Server.Utils.normalizeDate(validRates[row.chargeId][r].startDate);
            savedEndDate = EHR.Server.Utils.normalizeDate(validRates[row.chargeId][r].endDate);

            if (helper.getJavaHelper().dateCompare(rowStartDate, savedStartDate, format) >= 0 && helper.getJavaHelper().dateCompare(rowStartDate, savedEndDate, format) < 0
                    || helper.getJavaHelper().dateCompare(savedStartDate, rowStartDate, format) >= 0 && helper.getJavaHelper().dateCompare(savedStartDate,rowEndDate, format) < 0) {
                EHR.Server.Utils.addError(scriptErrors, 'chargeRateStartDate', "For charge Item " + row.name + ": Charge rate ("
                        + helper.getJavaHelper().formatDate(rowStartDate, format, false) + " to " + helper.getJavaHelper().formatDate(rowEndDate, format, false) +
                        ") overlaps a previous charge rate (" + helper.getJavaHelper().formatDate(savedStartDate, format, false) + " to " + helper.getJavaHelper().formatDate(savedEndDate, format, false) + ").", 'ERROR');
                return;
            }

            // Verify end date not within another range
            if (helper.getJavaHelper().dateCompare(rowEndDate, savedStartDate, format) >= 0 && helper.getJavaHelper().dateCompare(rowEndDate, savedEndDate, format) < 0) {
                EHR.Server.Utils.addError(scriptErrors, 'chargeRateEndDate', "For charge Item " + row.name + ": Charge rate ("
                        + helper.getJavaHelper().formatDate(rowStartDate, format, false) + " to " + helper.getJavaHelper().formatDate(rowEndDate, format, false) +
                        ") overlaps a previous charge rate (" + helper.getJavaHelper().formatDate(savedStartDate, format, false) + " to " + helper.getJavaHelper().formatDate(savedEndDate, format, false) + ").", 'ERROR');
                return;
            }
        }
    }

    var ciRow = {
        "name": row.name,
        "oldPk": row.oldPk,
        "category": row.category,
        "serviceCode": row.serviceCode,
        "departmentCode": row.departmentCode,
        "comment": row.comment,
        "active": row.active,
        "container": row.container,
        "startDate": row.chargeableItemStartDate,
        "endDate": row.chargeableItemEndDate
    };

    row.startDate = row.chargeRateStartDate;
    row.endDate = row.chargeRateEndDate;

    if (isItemUpdate) {
        ciRow.rowid = row.chargeId;
        LABKEY.Query.updateRows({
            schemaName: 'ehr_billing',
            queryName: 'chargeableItems',
            rows: [ciRow],
            scope: this,
            success: function (results) {
                row.chargeId = results.rows[0]["rowid"];
            },
            failure: function (error) {
                console.log("Insert rows error for ehr_billing.chargeableItems: " + error);
            }
        });
    }
    else {
        LABKEY.Query.insertRows({
            schemaName: 'ehr_billing',
            queryName: 'chargeableItems',
            rows: [ciRow],
            scope: this,
            success: function (results) {
                // Update cache
                validItems.push({"rowid":results.rows[0]["rowid"], "name":results.rows[0]["name"], "departmentCode":results.rows[0]["departmentcode"]});
                row.chargeId = results.rows[0]["rowid"];
            },
            failure: function (error) {
                console.log("Insert rows error for ehr_billing.chargeableItems: " + error);
            }
        });
    }

    if (validRates[row.chargeId]) {
        validRates[row.chargeId].push({"startDate":row.startDate, "endDate":row.endDate});
    }
    else {
        validRates[row.chargeId] = [{"startDate":row.startDate, "endDate":row.endDate}];
    }
}
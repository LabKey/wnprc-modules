require("ehr/triggers").initScript(this);

var chargeableItemCategories = {};
var chargeableItemCategoryRowIds = {};
var groups = {};

function onInit(event, helper){

    LABKEY.Query.selectRows({
        requiredVersion: 9.1,
        schemaName: 'ehr_billing',
        queryName: 'chargeableItemCategories',
        columns: ['rowId, name'],
        scope: this,
        success: function (results) {

            var rows = results.rows;

            for(var i=0; i< rows.length; i++) {
                var row = rows[i];
                chargeableItemCategories[row["name"]["value"]] = row["rowId"]["value"];
                chargeableItemCategoryRowIds[row["rowId"]["value"]] = row["rowId"]["value"];
            }
        },
        failure: function (error) {
            console.log("Error getting data from ehr_billing.chargeableItemCategories while uploading groupCategoryAssociations data: " + error);
        }
    });

    LABKEY.Query.selectRows({
        requiredVersion: 9.1,
        schemaName: 'ehr_billing',
        queryName: 'chargeUnits',
        columns: ['groupName'],
        scope: this,
        success: function (results) {

            var rows = results.rows;

            for(var i=0; i< rows.length; i++) {
                var row = rows[i];
                groups[row["groupName"]["value"]] = row["groupName"]["value"];
            }
        },
        failure: function (error) {
            console.log("Error getting data from ehr_billing.chargeUnits while uploading groupCategoryAssociations data: " + error);
        }
    });
}

function onInsert(helper, scriptErrors, row, oldRow) {

    var category = row.chargeCategoryId; //When uploading via Bulk Edit, this is a text value, and these text values under 'Category' header get set to chargeCategoryId field. In insert row case, this value is a rowId.

    //Insert Row case when user selects from a pre-populated dropdown, or when rowIds are used for Category instead of name
    if (category === parseInt(category)) {

        if (!chargeableItemCategoryRowIds[parseInt(category)]) {
            EHR.Server.Utils.addError(scriptErrors, 'chargeCategoryId', "'" + category + "' is not a valid category. If this is a new category, please add to ehr_billing.chargeableItemCategories table by going to 'CHARGEABLE ITEM CATEGORIES' link on the main Finance page.", 'ERROR');
            return false;
        }
        else {
            row.chargeCategoryId = chargeableItemCategoryRowIds[category]; //set chargeCategoryId with expected rowid value
        }
    }

    //Bulk Edit case
    else {
        if (!chargeableItemCategories[category]) {

            EHR.Server.Utils.addError(scriptErrors, 'chargeCategoryId', "'" + category + "' is not a valid category. If this is a new category, please add to ehr_billing.chargeableItemCategories table by going to 'CHARGEABLE ITEM CATEGORIES' link on the main Finance page.", 'ERROR');
            return false;
        }
        else {
            row.chargeCategoryId = chargeableItemCategories[category]; //set chargeCategoryId with expected rowid value
        }
    }

    if (!groups[row.chargeGroupName]) {

        EHR.Server.Utils.addError(scriptErrors, 'chargeGroupName', "'" + row.chargeGroupName + "' is not a valid group. If this is a new group, please add to ehr_billing.chargeUnits table by going to 'GROUPS' link on the main Finance page.", 'ERROR');
        return false;
    }
}
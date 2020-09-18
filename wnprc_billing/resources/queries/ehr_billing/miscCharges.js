require("ehr/triggers").initScript(this);

var LABKEY = require("labkey");
var billingHelper = new org.labkey.ehr_billing.query.EHRBillingTriggerHelper(LABKEY.Security.currentUser.id, LABKEY.Security.currentContainer.id);

EHR.Server.TriggerManager.registerHandlerForQuery(EHR.Server.TriggerManager.Events.BEFORE_UPSERT, 'ehr_billing', 'miscCharges', function(helper, scriptErrors, row, oldRow){

    if (!helper.isETL() && row) {

        if (!row.Id) {
            if (!row.debitedaccount) {
                EHR.Server.Utils.addError(scriptErrors, 'debitedaccount', 'Must provide Debit Account and Investigator.');
            }
        }

        if (row.debitedaccount) {
            row.debitedaccount = row.debitedaccount.replace(/^\s+|\s+$/g, '');
        }

        if (row.creditedaccount) {
            row.creditedaccount = row.creditedaccount.replace(/^\s+|\s+$/g, '');
        }

        if (!row.chargeId && !row.unitcost) {
            EHR.Server.Utils.addError(scriptErrors, 'chargeId', 'Must provide either Charge Item or Unit Cost', 'ERROR');
        }

        if (!row.comment) {
            EHR.Server.Utils.addError(scriptErrors, 'comment', 'Comment cannot be blank, it is expected as an line item on an Invoice', 'ERROR');
        }

        if (row.invoiceId) {

            var severity = 'INFO';
            var fields = ['Id', 'project', 'debitedaccount', 'chargeGroup', 'creditedaccount', 'chargeId', 'quantity', 'unitcost'];

            for (var i = 0; i < fields.length; i++) {
                if (row[fields[i]] != oldRow[fields[i]]) {
                    severity = 'WARN';
                }
            }
            severity = billingHelper.isBillingAdmin() || billingHelper.isDataAdmin() ? 'INFO' : severity;
            EHR.Server.Utils.addError(scriptErrors, 'Id', 'This item has already been invoiced and should not be edited through this form unless you are certain about this change.', severity);
        }

        row.objectid = row.objectid || LABKEY.Utils.generateUUID().toUpperCase();
    }
});
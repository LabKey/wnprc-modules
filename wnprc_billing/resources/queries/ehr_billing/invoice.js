require("ehr/triggers").initScript(this);

function onUpsert(helper, scriptErrors, row, oldRow) {

    LABKEY.Query.selectRows({
        requiredVersion: 9.1,
        schemaName: 'ehr_billing',
        queryName: 'invoiceRuns',
        columns: ['objectId, runDate'],
        filterArray: [LABKEY.Filter.create('objectId', row.invoiceRunId, LABKEY.Filter.Types.EQUAL)],
        scope: this,
        success: function (results) {

            var billingRunDate;
            var pmtReceivedDate;
            var format = "E MMM dd yyyy";

            if (!results || !results.rows || results.rows.length < 1)
                return;

            //get billing run date
            billingRunDate = EHR.Server.Utils.normalizeDate(results.rows[0]["runDate"]["value"]);
            console.log("billingRunDate results = ", billingRunDate);

            //get invoice sent date
            var invoiceSentDate = EHR.Server.Utils.normalizeDate(row.invoiceSentOn);

            if (row.paymentAmountReceived && !row.paymentReceivedOn) {
                EHR.Server.Utils.addError(scriptErrors, 'paymentReceivedOn', "Payment Received On cannot be blank if there is Payment Amount Received amount", 'ERROR');
                return false;
            }

            //validations

            //error if payment received is greater than
            //error if invoice sent date is before billing run date
            if (helper.getJavaHelper().dateCompare(billingRunDate, invoiceSentDate, format) > 0) {
                EHR.Server.Utils.addError(scriptErrors, 'invoiceSentDate', "Invoice Sent date" +
                        " date (" + helper.getJavaHelper().formatDate(invoiceSentDate, format, false) + ") is before " +
                        " Billing Run Date (" + helper.getJavaHelper().formatDate(billingRunDate, format, false) + ").", 'ERROR');
                return false;
            }

            if (row.paymentReceivedOn) {

                pmtReceivedDate = EHR.Server.Utils.normalizeDate(row.paymentReceivedOn);

                //error if payment received date is before billing run date
                if (helper.getJavaHelper().dateCompare(billingRunDate, pmtReceivedDate, format) > 0) {
                    EHR.Server.Utils.addError(scriptErrors, 'paymentReceivedOn', "Payment received date" +
                            " date (" + helper.getJavaHelper().formatDate(pmtReceivedDate, format, false) + ") is before " +
                            " Billing Run Date (" + helper.getJavaHelper().formatDate(billingRunDate, format, false) + ").", 'ERROR');
                    return false;
                }
            }

        },
        failure: function (error) {
            console.log(error);
        }
    });

    //calculate balanceDue
    // This simple calculation will suffice. In most cases, payment will be received in full.
    // In rare cases, there will be max of 2 checks - first check with a major amount, and second check with remaining
    // missed amount. When the second check is received, paymentAmountReceived will be set to the invoiceAmount marking
    // full payment received/zero balance due.
    // See support Ticket 38821.
    if (row.paymentAmountReceived != null) {
        row.balanceDue = row.invoiceAmount - row.paymentAmountReceived;
    }

    if(row.balanceDue <= 0) {
        row.fullPaymentReceived = true;
    }
    else {
        row.fullPaymentReceived = false;
    }
}
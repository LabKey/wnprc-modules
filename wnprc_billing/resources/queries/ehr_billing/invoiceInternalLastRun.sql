SELECT
       invInternal.rowId,
       invInternal.invoiceNumber,
       invInternal.invoiceRunId,
       invInternal.billingPeriodStart,
       invInternal.billingPeriodEnd,
       invInternal.BillingRunDate,
       invInternal.accountNumber,
       invInternal.type,
       invInternal.po_number,
       invInternal.contact_name,
       invInternal.address,
       invInternal.invoiceAmount
FROM ehr_billing.invoiceInternal invInternal WHERE invInternal.invoiceRunId =(SELECT max(invoiceRunId) from ehr_billing.invoiceInternal)
GROUP BY
         invInternal.rowId,
         invInternal.invoiceNumber,
         invInternal.invoiceRunId,
         invInternal.billingPeriodStart,
         invInternal.billingPeriodEnd,
         invInternal.BillingRunDate,
         invInternal.accountNumber,
         invInternal.type,
         invInternal.po_number,
         invInternal.contact_name,
         invInternal.address,
         invInternal.invoiceAmount


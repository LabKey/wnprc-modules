SELECT
  invExternal.rowId,
  invExternal.invoiceNumber,
  invExternal.invoiceRunId,
  invExternal.billingPeriodStart,
  invExternal.billingPeriodEnd,
  invExternal.BillingRunDate,
  invExternal.accountNumber,
  invExternal.type,
  invExternal.po_number,
  invExternal.contact_name,
  invExternal.address,
  invExternal.invoiceAmount
FROM ehr_billing.invoiceExternal invExternal WHERE invExternal.invoiceRunId =(SELECT max(invoiceRunId) from ehr_billing.invoiceExternal)

GROUP BY
         invExternal.rowId,
         invExternal.invoiceNumber,
         invExternal.invoiceRunId,
         invExternal.billingPeriodStart,
         invExternal.billingPeriodEnd,
         invExternal.BillingRunDate,
         invExternal.accountNumber,
         invExternal.type,
         invExternal.po_number,
         invExternal.contact_name,
         invExternal.address,
         invExternal.invoiceAmount
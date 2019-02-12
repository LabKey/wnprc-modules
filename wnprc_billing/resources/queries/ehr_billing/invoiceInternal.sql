SELECT
  inv.rowId,
  inv.invoiceNumber,
  inv.invoiceRunId.rowId AS invoiceRunId,
  inv.invoiceRunId.billingPeriodStart,
  inv.invoiceRunId.billingPeriodEnd,
  inv.invoiceRunId.runDate AS BillingRunDate,
  inv.accountNumber,
  inv.accountNumber.type,
  inv.accountNumber.po_number,
  inv.accountNumber.contact_name,
  inv.accountNumber.address,
  inv.invoiceAmount
FROM ehr_billing.invoice inv
  RIGHT JOIN ehr_billing.invoiceRuns ir
  ON inv.invoiceRunId = ir.objectid
  AND inv.accountNumber.type NOT LIKE '%external%'

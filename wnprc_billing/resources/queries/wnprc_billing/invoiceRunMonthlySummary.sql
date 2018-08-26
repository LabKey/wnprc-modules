SELECT
  c.invoiceId,
  c.invoiceId.billingPeriodStart,
  c.invoiceId.billingPeriodEnd,
  c.category,
  max(c.total) as total

FROM wnprc_billing.invoicedItemsByInvoiceCategory c
WHERE c.category IS NOT NULL
GROUP BY c.invoiceId, c.category, c.invoiceId.billingPeriodStart, c.invoiceId.billingPeriodEnd

PIVOT total BY category
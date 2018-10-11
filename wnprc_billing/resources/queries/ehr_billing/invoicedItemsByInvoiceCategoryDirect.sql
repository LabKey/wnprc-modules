SELECT
  i.invoiceId,
  i.category,
  count(i.invoiceId) as numItems,
  sum(i.totalCostDirect) as total -- total cost without tier rates

FROM ehr_billing.invoicedItems i

GROUP BY i.invoiceId, i.category
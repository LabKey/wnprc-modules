SELECT
  i.invoiceId,
  i.invoiceId.rowid as invoiceRunId,
  i.project,
  sum(i.quantity) as numItems,
  sum(i.totalCost) as total,
  ' [Summary By Item]' as summaryByItem,
  ' [All Items]' as allItems

FROM wnprc_billing_public.publicInvoicedItems i

GROUP BY i.invoiceId, i.project, i.invoiceId.rowid
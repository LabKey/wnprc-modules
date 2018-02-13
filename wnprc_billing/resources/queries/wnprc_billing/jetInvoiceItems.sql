SELECT distinct
  ir.rowId as runId,
  replace(a.uw_udds, '-', '')  as Department,
  a.uw_fund as Fund,
  '4' as Program,
  a.uw_account as Project,
  a.charge_grant_accounts_Id as Account,
  invoicedItems.totalcost as Amount,
  'TBA' as Description,
  'TBA' as Jnl_Ln_Ref,
  NULL as Class,
  NULL as PurchRefNo,
  NULL as VoucherNo,
  NULL as InvoiceNo,
  NULL as ActivityID
FROM
  ehr_billing.invoicedItems
  left join ehr_billing.aliases a
    on invoicedItems.debitedAccount = a.alias
  left join ehr_billing.invoiceRuns ir
    on ir.objectid = invoicedItems.invoiceId
  WHERE
    a.type like '%internal%'

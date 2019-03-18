SELECT
  ii.invoiceId.rowId as runId,
  replace(a.uw_udds, '-', '')  as Department,
  a.uw_fund as Fund,
  '4' as Program,
  a.uw_account as Project,
  a.charge_grant_accounts_Id as Account,
  sum(ii.totalcost) as Amount,
  'Primate Center ' || to_char(ii.invoiceId.billingPeriodStart,'MON') as Description,
  to_char(ii.invoiceId.billingPeriodEnd, 'MMyy') || a.uw_account as Jnl_Ln_Ref,
  to_char(ii.invoiceId.billingPeriodEnd, 'MMyy') as billingPeriodMMyy,
  NULL as Class,
  NULL as PurchRefNo,
  NULL as VoucherNo,
  NULL as InvoiceNo,
  NULL as ActivityID
FROM
  ehr_billing.invoicedItems ii
  left join ehr_billing.aliases a
    on ii.debitedAccount = a.alias
  WHERE
    a.type like '%internal%'
GROUP BY
     ii.invoiceId.rowId,
     a.uw_udds,
     a.uw_fund,
     a.uw_account,
     a.charge_grant_accounts_Id,
     ii.invoiceId.billingPeriodStart,
     ii.invoiceId.billingPeriodEnd
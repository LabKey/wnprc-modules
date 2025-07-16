SELECT
  max(ii.rowid) AS spreadsheet_key,
  'UWMSN' as company,
  'ARMSN_AC2'as Internal_Service_Provider,
  ii.invoiceId.runDate AS document_date,
  ii.invoiceId.comment AS memo,
  'PG00011660' AS program,
  'GR000039734' AS project,
  'CC005442' AS costCenter,
  'FD0144' AS fund,
  'FN0400' AS function,
    ii.invoiceId.rowId as runId,
  '1' as row_id,
  '1' as internal_service_delivery,
  'UWMSN' as  Intercompany_Affiliate,
  replace(a.uw_udds, '-', '')  as Department,
  a.uw_fund as Fund,
  '???' as Workday_Program,
  a.uw_account as Project,
  '???' AS Workday_Project,
  a.charge_grant_accounts_Id as Account,
  sum(ii.totalcost) as Amount,
  'Primate Center ' || to_char(ii.invoiceId.billingPeriodStart,'MON') as Description,
  '????' AS Workday_function,
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
    lcase(a.type) like '%internal%' AND a.gencredits IS FALSE
GROUP BY
     ii.invoiceId.rowId,
     a.uw_udds,
     a.uw_fund,
     a.uw_account,
     a.charge_grant_accounts_Id,
     ii.invoiceId.runDate,
     ii.invoiceId.comment,
     ii.invoiceId.billingPeriodStart,
     ii.invoiceId.billingPeriodEnd
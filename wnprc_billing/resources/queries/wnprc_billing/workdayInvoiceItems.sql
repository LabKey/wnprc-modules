SELECT
    ii.invoiceId.rowId as runId,
    a.uw_account as Project,
    sum(ii.totalcost) as Amount,
    replace(a.uw_udds, '-', '')  as Department,
    a.uw_fund as Fund,
    ii.invoiceId.runDate AS document_date,
    ii.invoiceId.comment AS memo,
    a.charge_grant_accounts_Id as Account,
    'Primate Center ' || to_char(ii.invoiceId.billingPeriodStart,'MON') as Description,
    to_char(ii.invoiceId.billingPeriodEnd, 'MMyy') as billingPeriodMMyy
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
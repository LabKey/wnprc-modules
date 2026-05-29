/*
 * Copyright (c) 2018-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
    lcase(a.type) like '%internal%' AND a.gencredits IS FALSE
GROUP BY
     ii.invoiceId.rowId,
     a.uw_udds,
     a.uw_fund,
     a.uw_account,
     a.charge_grant_accounts_Id,
     ii.invoiceId.billingPeriodStart,
     ii.invoiceId.billingPeriodEnd
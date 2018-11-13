/*
 * Copyright (c) 2018 LabKey Corporation
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
SELECT distinct
  ir.rowId as runId,
  replace(a.uw_udds, '-', '')  as Department,
  a.uw_fund as Fund,
  '4' as Program,
  a.uw_account as Project,
  a.charge_grant_accounts_Id as Account,
  invoicedItems.totalcost as Amount,
  'Primate Center ' || to_char(ir.billingPeriodStart,'MON') as Description,
  to_char(ir.runDate, 'MMyy') || a.uw_account as Jnl_Ln_Ref,
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

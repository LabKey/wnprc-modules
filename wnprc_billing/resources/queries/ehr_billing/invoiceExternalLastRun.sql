/*
 * Copyright (c) 2019-2026 LabKey Corporation
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
SELECT DISTINCT
  invExternal.rowId,
  invExternal.invoiceNumber,
  invExternal.invoiceRunId,
  invExternal.billingPeriodStart,
  invExternal.billingPeriodEnd,
  invExternal.BillingRunDate,
  invExternal.accountNumber,
  invExternal.type,
  invExternal.po_number,
  invExternal.contact_name,
  invExternal.address,
  invExternal.invoiceAmount
FROM ehr_billing.invoiceExternal invExternal WHERE invExternal.invoiceRunId =(SELECT max(invoiceRunId) from ehr_billing.invoiceExternal)
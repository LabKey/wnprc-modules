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
SELECT 
  mcfr.Id,
  mcfr.date,
  mcfr.project,
  mcfr.quantity,
  mcfr.unitCost,
  mcfr.totalcost,
  mcfr.item,
  mcfr.chargeId,
  mcfr.chargeId.serviceCode,
  mcfr.chargeId.departmentCode AS groupName,
  mcfr.category,
  mcfr.comment AS itemDescription,
  mcfr.debitedAccount,
  mcfr.debitedAccount.investigatorName AS principalInvestigator,
  mcfr.debitedAccount.contact_name AS contactName,
  mcfr.debitedAccount.po_amount AS poAmount,
  mcfr.created,
  mcfr.createdby,
  mc.invoiceId,
  mc.taskId
FROM wnprc_billing.miscChargesFeeRates mcfr JOIN ehr_billing.miscCharges mc on mcfr.taskId = mc.taskId and mcfr.sourceRecord = mc.objectID
WHERE mc.invoiceId IS NULL
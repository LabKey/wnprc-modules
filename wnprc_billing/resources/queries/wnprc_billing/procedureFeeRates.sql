/*
 * Copyright (c) 2017 LabKey Corporation
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

SELECT *,
(procFees.quantity * procFees.unitCost) as totalCost
FROM
(SELECT
  pFees1.id,
  pFees1.date,
  pFees1.project,
  pFees1.account as debitedAccount,
  pFees1.sourceRecord,
  (case when pFees1.tubes >= 1 then cr1.unitCost end) as unitCost,
  (case when pFees1.tubes >= 1 then ('Blood Draws ' || pFees1.id) end) as comment,
  (case when pFees1.tubes >= 1 then 1 end) as quantity,
  pFees1.taskid,
  cr1.chargeId as chargeId,
  ci1.name as item,
  ci1.category as category,
  cr1.serviceCode as serviceCenter
 FROM wnprc_billing.procedureFees pFees1
 LEFT JOIN ehr_billing.chargeRates cr1 ON (
   CAST(pFees1.date AS DATE) >= CAST(cr1.startDate AS DATE) AND
   (CAST(pFees1.date AS DATE) <= cr1.enddate OR cr1.enddate IS NULL) AND
   cr1.description = 'Blood draws'
 )
 LEFT JOIN ehr_billing.chargeableItems ci1 ON ci1.name = cr1.description

UNION ALL

SELECT
  pFees2.id,
  pFees2.date,
  pFees2.project,
  pFees2.account as debitedAccount,
  pFees2.sourceRecord,
  (case when pFees2.tubes > 1 then cr2.unitCost end) as unitCost,
  null as comment,
  (case when pFees2.tubes > 1 then (pFees2.tubes - 1) else 0 end) as quantity,
  pFees2.taskid,
  cr2.chargeId as chargeId,
  ci2.name as item,
  ci2.category as category,
  cr2.serviceCode as serviceCenter
FROM wnprc_billing.procedureFees pFees2
  LEFT JOIN ehr_billing.chargeRates cr2 ON (
    CAST(pFees2.date AS DATE) >= CAST(cr2.startDate AS DATE) AND
    (CAST(pFees2.date AS DATE) <= cr2.enddate OR cr2.enddate IS NULL) AND
    cr2.description = 'Blood draws - Additional Tubes'
    )
  LEFT JOIN ehr_billing.chargeableItems ci2 ON ci2.name = cr2.description

) procFees
where procFees.quantity > 0
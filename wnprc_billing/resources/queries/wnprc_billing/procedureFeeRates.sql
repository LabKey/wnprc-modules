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
round((CAST((procFees.quantity * procFees.unitCostDirect) AS DOUBLE)), 2) AS totalCostDirect, -- total cost without tier rate
round((CAST((procFees.quantity * procFees.unitCost) AS DOUBLE)), 2) AS totalCost -- total cost with tier rate
FROM
(
SELECT
  pFees1.id,
  pFees1.date,
  pFees1.project,
  pFees1.account AS debitedAccount,
  pFees1.sourceRecord,
  (CASE WHEN pFees1.tubes >= 1 THEN cr1.unitCost END) AS unitCostDirect, -- unit cost without tier rate
  (CASE WHEN pFees1.tubes >= 1 THEN (cr1.unitCost + (pFees1.tierRate*cr1.unitCost)) end) AS unitCost, -- unit cost with tier rate
  (CASE WHEN pFees1.tubes >= 1 THEN ('Blood Draws ' || pFees1.id) end) AS comment,
  (CASE WHEN pFees1.tubes >= 1 THEN 1 end) AS quantity,
  pFees1.taskid,
  cr1.chargeId AS chargeId,
  ci1.name AS item,
  ci1.chargeCategoryId.name AS category,
  ci1.departmentCode AS groupName,
  NULL AS isMiscCharge,
  pFees1.tierRate,

  --fields used in email notification
  (CASE WHEN pFees1.account IS NULL THEN 'Y' ELSE NULL END) AS isMissingAccount,
  (CASE
     WHEN (pFees1.account.budgetStartDate IS NOT NULL AND CAST(pFees1.account.budgetStartDate AS date) > CAST(pFees1.date AS date))
             THEN 'Prior To Budget Start'
     WHEN (pFees1.account.budgetEndDate IS NOT NULL AND CAST(pFees1.account.budgetEndDate AS date) < CAST(pFees1.date AS date))
             THEN 'After Budget End'
     ELSE null END) AS isExpiredAccount,
  (CASE WHEN pFees1.account.isAcceptingCharges IS FALSE THEN 'N' END) AS isAcceptingCharges,
  (CASE WHEN (cr1.unitCost IS NULL OR cr1.unitCost = 0) THEN 'Y' ELSE null END) AS lacksRate,
  (CASE
     WHEN pFees1.account.investigatorId IS NOT NULL THEN pFees1.account.investigatorId
     WHEN pFees1.project.investigatorId IS NOT NULL THEN pFees1.project.investigatorId
     ELSE NULL END) AS investigator,
  CASE WHEN (TIMESTAMPDIFF('SQL_TSI_DAY', pFees1.date, curdate()) > 45) THEN 'Y' ELSE null END AS isOldCharge,
  pFees1.account.projectNumber,
  pFees1.performedby,
  pFees1.billedby


 FROM wnprc_billing.procedureFeesWithTierRates pFees1
 LEFT JOIN ehr_billing.chargeRates cr1 ON (
   CAST(pFees1.date AS DATE) >= CAST(cr1.startDate AS DATE) AND
   (CAST(pFees1.date AS DATE) <= cr1.enddate OR cr1.enddate IS NULL))
 LEFT JOIN ehr_billing.chargeableItems ci1 ON ci1.rowid = cr1.chargeId
 WHERE ci1.name = 'Blood draws'  and pFees1.billedby = 'a'

UNION ALL

SELECT
  pFees2.id,
  pFees2.date,
  pFees2.project,
  pFees2.account AS debitedAccount,
  pFees2.sourceRecord,
  (CASE WHEN pFees2.tubes > 1 THEN cr2.unitCost END) AS unitCostDirect, -- unit cost without tier rate
  (CASE WHEN pFees2.tubes > 1 THEN (cr2.unitCost + (pFees2.tierRate*cr2.unitCost)) END) AS unitCost, -- unit cost with tier rate
  null AS comment,
  (CASE WHEN pFees2.tubes > 1 THEN (pFees2.tubes - 1) ELSE 0 END) AS quantity,
  pFees2.taskid,
  cr2.chargeId AS chargeId,
  ci2.name AS item,
  ci2.chargeCategoryId.name AS category,
  ci2.departmentCode AS groupName,
  NULL AS isMiscCharge,
  pFees2.tierRate,

  --fields used in email notification
  (CASE WHEN pFees2.account IS NULL THEN 'Y' ELSE NULL END) AS isMissingAccount,
  (CASE
     WHEN (pFees2.account.budgetStartDate IS NOT NULL AND CAST(pFees2.account.budgetStartDate AS date) > CAST(pFees2.date AS date))
             THEN 'Prior To Budget Start'
     WHEN (pFees2.account.budgetEndDate IS NOT NULL AND CAST(pFees2.account.budgetEndDate AS date) < CAST(pFees2.date AS date))
             THEN 'After Budget End'
     ELSE null END) AS isExpiredAccount,
  (CASE WHEN pFees2.account.isAcceptingCharges IS FALSE THEN 'N' END) AS isAcceptingCharges,
  (CASE WHEN (cr2.unitCost IS NULL OR cr2.unitCost = 0) THEN 'Y' ELSE null END) AS lacksRate,
  (CASE
     WHEN pFees2.account.investigatorId IS NOT NULL THEN pFees2.account.investigatorId
     WHEN pFees2.project.investigatorId IS NOT NULL THEN pFees2.project.investigatorId
     ELSE NULL END) AS investigator,
       CASE WHEN (TIMESTAMPDIFF('SQL_TSI_DAY', pFees2.date, curdate()) > 45) THEN 'Y' ELSE null END AS isOldCharge,
  pFees2.account.projectNumber,
  pFees2.performedby,
  pFees2.billedby

FROM wnprc_billing.procedureFeesWithTierRates pFees2
  LEFT JOIN ehr_billing.chargeRates cr2 ON (
    CAST(pFees2.date AS DATE) >= CAST(cr2.startDate AS DATE) AND
    (CAST(pFees2.date AS DATE) <= cr2.enddate OR cr2.enddate IS NULL))
  LEFT JOIN ehr_billing.chargeableItems ci2 ON ci2.rowid = cr2.chargeId
  WHERE ci2.name = 'Blood draws - Additional Tubes' and pFees2.billedby= 'a'

UNION ALL

SELECT
    pFees3.id,
    pFees3.date,
    pFees3.project,
    pFees3.account AS debitedAccount,
    pFees3.sourceRecord,
    (CASE WHEN pFees3.tubes >= 1 THEN cr3.unitCost END) AS unitCostDirect, -- unit cost without tier rate
    (CASE WHEN pFees3.tubes >= 1 THEN (cr3.unitCost + (pFees3.tierRate*cr3.unitCost)) end) AS unitCost, -- unit cost with tier rate
    (CASE WHEN pFees3.tubes >= 1 THEN ('Blood Draws ' || pFees3.id) end) AS comment,
    (CASE WHEN pFees3.tubes >= 1 THEN 1 end) AS quantity,
    pFees3.taskid,
    cr3.chargeId AS chargeId,
    ci3.name AS item,
    ci3.chargeCategoryId.name AS category,
    ci3.departmentCode AS groupName,
    NULL AS isMiscCharge,
    pFees3.tierRate,

    --fields used in email notification
    (CASE WHEN pFees3.account IS NULL THEN 'Y' ELSE NULL END) AS isMissingAccount,
    (CASE
         WHEN (pFees3.account.budgetStartDate IS NOT NULL AND CAST(pFees3.account.budgetStartDate AS date) > CAST(pFees3.date AS date))
             THEN 'Prior To Budget Start'
         WHEN (pFees3.account.budgetEndDate IS NOT NULL AND CAST(pFees3.account.budgetEndDate AS date) < CAST(pFees3.date AS date))
             THEN 'After Budget End'
         ELSE null END) AS isExpiredAccount,
    (CASE WHEN pFees3.account.isAcceptingCharges IS FALSE THEN 'N' END) AS isAcceptingCharges,
    (CASE WHEN (cr3.unitCost IS NULL OR cr3.unitCost = 0) THEN 'Y' ELSE null END) AS lacksRate,
    (CASE
         WHEN pFees3.account.investigatorId IS NOT NULL THEN pFees3.account.investigatorId
         WHEN pFees3.project.investigatorId IS NOT NULL THEN pFees3.project.investigatorId
         ELSE NULL END) AS investigator,
    CASE WHEN (TIMESTAMPDIFF('SQL_TSI_DAY', pFees3.date, curdate()) > 45) THEN 'Y' ELSE null END AS isOldCharge,
    pFees3.account.projectNumber,
    pFees3.performedby,
    pFees3.billedby


FROM wnprc_billing.procedureFeesWithTierRates pFees3
         LEFT JOIN ehr_billing.chargeRates cr3 ON (
            CAST(pFees3.date AS DATE) >= CAST(cr3.startDate AS DATE) AND
            (CAST(pFees3.date AS DATE) <= cr3.enddate OR cr3.enddate IS NULL))
         LEFT JOIN ehr_billing.chargeableItems ci3 ON ci3.rowid = cr3.chargeId
WHERE ci3.name = 'Blood draws NWM'  and pFees3.billedby = 'c'

UNION ALL

SELECT
    pFees4.id,
    pFees4.date,
    pFees4.project,
    pFees4.account AS debitedAccount,
    pFees4.sourceRecord,
    (CASE WHEN pFees4.tubes > 1 THEN cr4.unitCost END) AS unitCostDirect, -- unit cost without tier rate
    (CASE WHEN pFees4.tubes > 1 THEN (cr4.unitCost + (pFees4.tierRate*cr4.unitCost)) END) AS unitCost, -- unit cost with tier rate
    null AS comment,
    (CASE WHEN pFees4.tubes > 1 THEN (pFees4.tubes - 1) ELSE 0 END) AS quantity,
    pFees4.taskid,
    cr4.chargeId AS chargeId,
    ci4.name AS item,
    ci4.chargeCategoryId.name AS category,
    ci4.departmentCode AS groupName,
    NULL AS isMiscCharge,
    pFees4.tierRate,

    --fields used in email notification
    (CASE WHEN pFees4.account IS NULL THEN 'Y' ELSE NULL END) AS isMissingAccount,
    (CASE
         WHEN (pFees4.account.budgetStartDate IS NOT NULL AND CAST(pFees4.account.budgetStartDate AS date) > CAST(pFees4.date AS date))
             THEN 'Prior To Budget Start'
         WHEN (pFees4.account.budgetEndDate IS NOT NULL AND CAST(pFees4.account.budgetEndDate AS date) < CAST(pFees4.date AS date))
             THEN 'After Budget End'
         ELSE null END) AS isExpiredAccount,
    (CASE WHEN pFees4.account.isAcceptingCharges IS FALSE THEN 'N' END) AS isAcceptingCharges,
    (CASE WHEN (cr4.unitCost IS NULL OR cr4.unitCost = 0) THEN 'Y' ELSE null END) AS lacksRate,
    (CASE
         WHEN pFees4.account.investigatorId IS NOT NULL THEN pFees4.account.investigatorId
         WHEN pFees4.project.investigatorId IS NOT NULL THEN pFees4.project.investigatorId
         ELSE NULL END) AS investigator,
    CASE WHEN (TIMESTAMPDIFF('SQL_TSI_DAY', pFees4.date, curdate()) > 45) THEN 'Y' ELSE null END AS isOldCharge,
    pFees4.account.projectNumber,
    pFees4.performedby,
    pFees4.billedby

FROM wnprc_billing.procedureFeesWithTierRates pFees4
         LEFT JOIN ehr_billing.chargeRates cr4 ON (
            CAST(pFees4.date AS DATE) >= CAST(cr4.startDate AS DATE) AND
            (CAST(pFees4.date AS DATE) <= cr4.enddate OR cr4.enddate IS NULL))
         LEFT JOIN ehr_billing.chargeableItems ci4 ON ci4.rowid = cr4.chargeId
WHERE ci4.name = 'Blood draws NWM - Additional Tubes' and pFees4.billedby= 'c'

)
procFees
WHERE procFees.quantity > 0
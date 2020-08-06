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

  SELECT
    *,
    round(CAST(pdr.quantity * pdr.unitCostDirect AS DOUBLE), 2) AS totalCostDirect, -- total cost without tier rate
    round(CAST(pdr.quantity * pdr.unitCost AS DOUBLE), 2) AS totalCost -- total cost with tier rate
  FROM
    (SELECT
    pdt.id,
    pdt.adate AS date,
    pdt.project,
    pdt.account AS debitedAccount,
    cr1.unitCost AS unitCostDirect, -- unit cost without tier rate
   (cr1.unitCost + (cr1.unitCost * pdt.tierRate)) AS unitCost, -- unit cost with tier rate
    pdt.quantity,
    cr1.chargeId AS chargeId,
    ci1.name AS item,
    ci1.chargeCategoryId.name AS category,
    pdt.comment,
    ci1.departmentCode AS groupName,
    pdt.tierRate AS tierRate,
    NULL AS isMiscCharge,

    --fields used in email notification
    (CASE WHEN pdt.account IS NULL THEN 'Y' ELSE NULL END) AS isMissingAccount,
    (CASE
       WHEN (pdt.account.budgetStartDate IS NOT NULL AND CAST(pdt.account.budgetStartDate AS date) > CAST(pdt.adate AS date))
               THEN 'Prior To Budget Start'
       WHEN (pdt.account.budgetEndDate IS NOT NULL AND CAST(pdt.account.budgetEndDate AS date) < CAST(pdt.adate AS date))
               THEN 'After Budget End'
       ELSE null END) AS isExpiredAccount,
    (CASE WHEN pdt.account.isAcceptingCharges IS FALSE THEN 'N' END) AS isAcceptingCharges,
    (CASE WHEN (cr1.unitCost IS NULL OR cr1.unitCost = 0) THEN 'Y' ELSE null END) AS lacksRate,
    (CASE
       WHEN pdt.account.investigatorId IS NOT NULL THEN pdt.account.investigatorId
       WHEN pdt.project.investigatorId IS NOT NULL THEN pdt.project.investigatorId
       ELSE NULL END) AS investigator,
    CASE WHEN (TIMESTAMPDIFF('SQL_TSI_DAY', pdt.adate, curdate()) > 45) THEN 'Y' ELSE null END AS isOldCharge,
    pdt.account.projectNumber

     FROM wnprc_billing.perDiemWithTierRates pdt
  LEFT JOIN ehr_billing.chargeRates cr1 ON (
    CAST(pdt.adate AS DATE) >= CAST(cr1.startDate AS DATE) AND
    (CAST(pdt.adate AS DATE) <= cr1.enddate OR cr1.enddate IS NULL))
  LEFT JOIN ehr_billing.chargeableItems ci1 ON ci1.rowid = cr1.chargeId) pdr
  WHERE pdr.item = 'Per diems'
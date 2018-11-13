/*
 * Copyright (c) 2017-2018 LabKey Corporation
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

-- get accounts that are in ehr_billing.aliases for active or null tierRates
SELECT * FROM
  (
    SELECT
      pdi.Id,
      pdi.adate,
      pdi.edate,
      pdi.totalDaysPerAccount AS quantity,
      pdi.account,
      pdi.project,
      pdi.comment,
      COALESCE(a.tier_rate.tierRate, 0) AS tierRate,
      a.tier_rate.isActive AS isTierRateActive
    FROM wnprc_billing.perDiemRatesIntermediate pdi
    INNER JOIN ehr_billing.aliases a ON a.alias = pdi.account
  ) accountsInAliases WHERE accountsInAliases.isTierRateActive IS NULL OR accountsInAliases.isTierRateActive = true

UNION ALL --union is necessary/cleaner since not all the accounts are in ehr_billing.aliases to be able to get the tierRates

-- accounts that are in not ehr_billing.aliases
SELECT
  pdi.Id,
  pdi.adate,
  pdi.edate,
  pdi.totalDaysPerAccount AS quantity,
  pdi.account,
  pdi.project,
  pdi.comment,
  0 as TierRate,
  true AS isTierRateActive
FROM wnprc_billing.perDiemRatesIntermediate pdi
LEFT JOIN ehr_billing.aliases a ON a.alias = pdi.account WHERE a.alias IS NULL
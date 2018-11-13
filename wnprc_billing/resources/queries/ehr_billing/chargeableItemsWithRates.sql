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
-- this query will be used to get the columns for the template
SELECT
--   "test" AS oldPk,
  ci.name,
  ci.chargeCategoryId AS category,
  ci.serviceCode,
  ci.departmentCode,
  ci.startDate AS chargeableItemStartDate,
  ci.endDate AS chargeableItemEndDate,
  ci.comment,
  ci.active,
  ci.allowBlankId,
  cr.unitCost,
  cr.genCredits,
  cr.startDate AS chargeRateStartDate,
  cr.endDate AS chargeRateEndDate
  FROM ehr_billing.chargeableItems ci
  FULL OUTER JOIN ehr_billing.chargeRates cr
    ON ci.rowid = cr.chargeId
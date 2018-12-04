/*
 * Copyright (c) 2013 LabKey Corporation
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
ci.name,
null as itemCode,
group_concat(distinct ci.chargeCategoryId, chr(10)) as categories,
count(*) as total

from ehr_billing.chargeableItems ci
where ci.active = true
group by ci.name
having count(*) > 1

UNION ALL

SELECT
group_concat(distinct ci.name, chr(10)) as name,
ci.itemCode,
group_concat(distinct ci.chargeCategoryId, chr(10)) as categories,
count(*) as total

from ehr_billing.chargeableItems ci
where ci.active = true and ci.itemCode is not null

group by ci.itemCode, ci.chargeCategoryId
having count(*) > 1
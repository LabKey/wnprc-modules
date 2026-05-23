/*
 * Copyright (c) 2017-2026 Board of Regents of the University of Wisconsin System
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
/*
 * This is a Business Continuity Report of the current treatments in the Primate Center.
 */

SELECT
Id,

Id.curlocation.area as area,
Id.curlocation.room as room,
Id.curlocation.cage as cage,
Id.mostRecentWeight.mostRecentWeight as weight,

frequency.meaning as frequency,
code.meaning as treatment,
meaning as shortName,
qualifier,
route.meaning as route,
remark,

volume,
vol_units as volumeUnits,
concentration,
conc_units as concentrationUnits,
dosage,
dosage_units as dosageUnits,
amount,
amount_units as amountUnits,

date as startdate,
enddate,
project,
project.account as account,
code as treatmentCode

FROM study.treatment_order treatments

WHERE (
  (date < curdate())
  AND
  (
    (enddate IS NULL)
    OR
    (enddate > curdate())
  )
)
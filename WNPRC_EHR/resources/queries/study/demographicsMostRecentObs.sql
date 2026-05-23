/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
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
 * Note that this query is incredibly slow.  It is meant to provide information through the cached
 * MostRecentObsDemographicsProvider class.
 */

SELECT
  lastob.Id,
  lastob.lastdate as lastObservationDate,
  remark   as lastObservationRemark,
  feces    as lastObservationFeces,
  menses   as lastObservationMenses,
  other    as lastObservationOther,
  behavior as lastObservationBehavior,
  breeding as lastObservationBreeding

FROM
(
    SELECT Id, MAX(date) as lastdate FROM study.obs
    WHERE isIrregular = TRUE
    GROUP BY Id
) as lastob

INNER JOIN study.obs irobs
ON lastob.lastdate = irobs.date AND lastob.Id = irobs.Id
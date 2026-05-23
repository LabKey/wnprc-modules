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
 * This is a Business Continuity Report of the current Locations of animals in the Primate Center.
 */

SELECT *

FROM (
  SELECT
  Id as id,
  id.demographics.medical as medical,
  id.demographics.v_status as viralStatus,
  Id.mostRecentWeight.mostRecentWeight as weight,
  id.curLocation.area as area,
  id.curLocation.room as room,
  id.curLocation.cage as cage,
  id.curLocation.cond as condition,
  id.curLocation.remark as remark,
  calculated_status as status

  FROM study.demographics
) as housing

WHERE status = 'Alive'
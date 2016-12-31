/*
 * Copyright (c) 2010-2013 LabKey Corporation
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
  r.room,
  count(DISTINCT c.cage) as TotalCages,
  count(DISTINCT h.cage) as CagesUsed,
  count(DISTINCT c.cage) - count(DISTINCT h.cage) as CagesEmpty,
  count(DISTINCT h.id) as TotalAnimals

FROM ehr_lookups.rooms r
LEFT JOIN ehr_lookups.cage c ON (r.room = c.room)
LEFT JOIN study.housing h ON (r.room=h.room AND (c.cage=h.cage OR (c.cage is null and h.cage is null)) AND COALESCE(h.enddate, now()) >= now())

GROUP BY r.room
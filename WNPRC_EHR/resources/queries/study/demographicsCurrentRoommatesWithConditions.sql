@ -0,0 +1,36 @@
/*
 *
 *  * Copyright (c) 2025 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */
 -- This query displays current roommates taking into consideration g/gpc condition codes if animals appear to be single housed

SELECT
    d.id,
    count(DISTINCT h.RoommateId) as NumRoommates,
    (count(DISTINCT h.RoommateId)+1) as AnimalsInCage,
    group_concat(DISTINCT h.RoommateId) as cagemates

FROM study.demographics d
         LEFT JOIN (
    SELECT
        h1.id,
        h2.id as RoommateId
    FROM study.Housing h1
             LEFT OUTER JOIN study.Housing h2 ON (
        h1.enddate IS NULL AND -- only look at current housing assignments (no end date)
        h2.enddate IS NULL AND -- only look at current housing assignments (no end date)
        h1.id != h2.id AND -- don't include self as roommate
        h1.room = h2.room AND -- Make sure room matches
        (((h1.cage = h2.cage OR (h1.cage is null and h2.cage is null)) OR -- make sure cage matches
          (((h1.cond = 'g' OR h1.cond = 'gpc') and (h2.cond = 'g' OR h2.cond = 'gpc')) AND
           (ABS(CAST(nullif(h1.cage, '') AS integer) - CAST(nullif(h2.cage, '') AS integer)) <= 5)
              ) -- exclude cages with gpc/g conditions if single housed and cages with g/gpc exist within 5 cages
             ) and (h1.cage not like '%pen%' and h2.cage not like '%pen%')))
    WHERE h1.qcstate.publicdata = true AND h2.qcstate.publicdata = true
) h
                   ON (h.id = d.id)

WHERE d.calculated_status='Alive'

GROUP BY d.id
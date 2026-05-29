/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
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
voGi.id,
CAST (voGi.date AS DATE) AS Date,
voGi.volume,
voGi.RecentWeight,
voGi.InnerWeight,
voGi.objectid
--voGi.DayDiff

FROM (

SELECT
    wa.id AS id,
    wa.date AS date,
    wa.volume,
    (SELECT we.weight
        FROM study.weight we
        --INNER JOIN study.weight wein
        --ON we.id = wein.id
        WHERE we.id = wa.id AND we.date = (SELECT MAX(wen.date) from study.weight wen WHERE wen.id=wa.id AND timestampdiff('SQL_TSI_DAY',wa.date,wen.date)<=0))AS InnerWeight,
    (SELECT MAX(wen.date)  from study.weight wen WHERE wen.id=wa.id AND timestampdiff('SQL_TSI_DAY',wa.date,wen.date)<=0) AS RecentWeight,
    wa.objectid
    --timestampdiff('SQL_TSI_DAY',wa.date ,wa.RecentWeight) AS DayDiff

    FROM study.waterGiven wa
) voGi
--GROUP BY voGi.id, voGi.date,voGi.RecentWeight,voGi.InnerWeight
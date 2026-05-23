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
PARAMETERS(CheckDate TIMESTAMP)

SELECT
    DISTINCT(id),
    Id.death.date AS deathDate,
    CheckDate AS date,
    project AS project,
    location as location
FROM
    (SELECT
        a.id,
        a.MostRecentWaterCondition,
        a.MostRecentWaterConditionDate,
        a.project,
        a.location
    FROM study.demographicsMostRecentWaterCondition a
     WHERE NOT EXISTS (
         SELECT 1 FROM study.waterTotalByDate b
                       WHERE a.id = b.id AND b.date = CheckDate AND b.TotalWater IS NOT NULL
         )
    )
WHERE MostRecentWaterCondition = 'regulated' AND MostRecentWaterConditionDate <= CheckDate
AND (Id.death.date IS NULL OR CheckDate <= Id.death.date )
ORDER BY project
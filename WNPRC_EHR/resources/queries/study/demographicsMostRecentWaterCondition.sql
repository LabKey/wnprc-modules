/*
 * Copyright (c) 2020-2026 Board of Regents of the University of Wisconsin System
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

wsa.id,
wsa.MostRecentWaterConditionDate,
wsa.room || '-' || wsa.cage as location,
(
    SELECT wsainner.project
    FROM study.waterScheduledAnimals wsainner
    WHERE wsa.id = wsainner.id AND wsa.MostRecentWaterConditionDate = wsainner.date

)  AS project,
(
      SELECT wsainner.mlsperKg
      FROM study.waterScheduledAnimals wsainner
      WHERE wsa.id = wsainner.id AND wsa.MostRecentWaterConditionDate = wsainner.date

)  AS mlsperKg,
(
     SELECT wsainner.condition
     FROM study.waterScheduledAnimals wsainner
     WHERE wsa.id = wsainner.id AND wsa.MostRecentWaterConditionDate = wsainner.date

) AS MostRecentWaterCondition
FROM(
    SELECT
        wsaouter.id as id,
        max(wsaouter.date) AS MostRecentWaterConditionDate,
        max(wsaouter.id.dataset.activehousing.room) AS room,
        max(wsaouter.id.dataset.activehousing.cage) AS cage,

    FROM study.waterScheduledAnimals wsaouter
    WHERE wsaouter.qcstate.publicdata = true AND wsaouter.condition IS NOT NULL
    AND (Id.death.date IS NULL)
    GROUP BY wsaouter.id
        ) wsa

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
    lsid AS lsid,
    objectid AS objectIdCoalesced,
    waterOrderObjectId AS waterOrderObjectId,
    taskid AS taskid,
    project AS projectCoalesced,
    Id AS Id,
    room || '-' || cage  AS location,
    date AS date,
    dateOrdered AS dateOrdered,
    startDateCoalesced AS startDateCoalesced,
    volume AS volume,
    provideFruit AS provideFruit,
    provideFruitTitle AS provideFruitTitle,
    dataSource AS dataSource,
    waterSource AS conditionAtTime,
    assignedTo AS assignedToCoalesced,
    assignedToTitle AS assignedToTitleCoalesced,
    frequency AS frequencyCoalesced,
    frequencyMeaning AS frequencyMeaningCoalesced,
    timeofday AS timeofday,
    displaytimeofday AS displaytimeofday,
    actionRequired AS actionRequired,
    qcstate AS qcstate,

    --(SELECT max(wg.qcstate) as label FROM study.waterGiven wg WHERE WCO.objectid = wg.treatmentid AND WCO.dateOrdered = wg.dateordered ) AS waterStatus,
   -- (SELECT timestampdiff(SQL_TSI_HOUR,WCO.date,wg.dateordered ) as diff FROM study.waterGiven wg WHERE WCO.objectid = wg.treatmentid  ) AS difference,

    (SELECT wg.weight AS weightAtDate
        FROM study.weight wg
        WHERE wg.id = WCO.Id AND CAST(substring(CAST(wg.date AS VARCHAR) , 1, 10) AS DATE) <= WCO.date
        ORDER BY wg.date DESC
        LIMIT 1
    ) AS weightAtDate,

    (SELECT wg.date AS weightDate
        FROM study.weight wg
        WHERE wg.id = WCO.Id AND CAST(substring(CAST(wg.date AS VARCHAR) , 1, 10) AS DATE) <= WCO.date
        ORDER BY wg.date DESC
        LIMIT 1
    ) AS weightDate

FROM study.waterScheduleCoalesced WCO
--WHERE WCO.dateRangeStartDate >= curdate()
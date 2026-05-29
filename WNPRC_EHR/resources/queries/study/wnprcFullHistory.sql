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
SELECT Id,
       date,
       project  AS project,
       DataSet.Label AS dataset,
       DataSet.Name AS DataSetName,
       remark,
       description,
       performedby,
       qcstate,
       taskid,
       requestid
FROM study.studyData

UNION ALL
SELECT
    Id AS Id,
    date,
    project AS project,
    'Water Given (Total)' AS dataset,
    'watertotal' AS DataSetName,
    CASE
         WHEN (remarksConcat IS NOT NULL AND remarksConcat !='') THEN
             ('Sum of all water given for the day.' || CHR(10)
                 || remarksConcat)
             ELSE
            'Sum of all water given for the day.'
    END AS remark,
    CASE
         WHEN (provideFruit IS NOT NULL AND provideFruit != '') THEN
            ('Total Water for the day equals: ' || TotalWater || 'ml' || CHR(10)
            || 'Food provided: ' || provideFruit)
         ELSE
            ('Total Water for the day equals: ' || TotalWater || 'ml')
    END AS description,
    performedConcat AS performedBy,
    qcstate AS qcstate,
    null AS  taskid,
    null AS requestid

FROM study.waterTotalByDate
WHERE TotalWater IS NOT NULL
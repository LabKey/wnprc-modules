/*
 * Copyright (c) 2024 LabKey Corporation
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

-- Get rows where num_tubes = 1
SELECT
    Id,
    date,
    project,
    project.account.alias AS debitedAccount,
    project.account.tier_rate.tierRate AS otherRate,
    objectid AS sourceRecord,
    ('Blood Draws ' || Id) AS comment,
    CAST(num_tubes AS DOUBLE) AS quantity,
    taskId,
    performedby
FROM studyLinked.BloodSchedule bloodSch
WHERE
    num_tubes = 1 AND
    billedBy.value = 'a' AND
    qcstate.publicdata = true

UNION

-- Get the 1st tube where num_tubes > 1
SELECT
    Id,
    date,
    project,
    project.account.alias AS debitedAccount,
    project.account.tier_rate.tierRate AS otherRate,
    objectid AS sourceRecord,
    ('Blood Draws ' || Id) AS comment,
    1.0 AS quantity,
    taskId,
    performedby
FROM studyLinked.BloodSchedule bloodSch
WHERE
    num_tubes > 1 AND
    billedBy.value = 'a' AND
    qcstate.publicdata = true
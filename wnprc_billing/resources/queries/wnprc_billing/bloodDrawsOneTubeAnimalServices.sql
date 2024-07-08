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

-- Get rows where num_tubes = 1 and the 1st tube where num_tubes > 1
SELECT
    Id,
    date,
    project,
    coalesce(account, project.account.alias) AS debitedAccount,
    coalesce(a.tier_rate.tierRate, project.account.tier_rate.tierRate) as otherRate,
    objectid AS sourceRecord,
    ('Blood Draws ' || Id) AS comment,
    CAST (1 AS DOUBLE) AS quantity,
    taskId,
    performedby
FROM studyLinked.BloodSchedule bloodSch
    LEFT JOIN ehr_billing.aliases a ON bloodSch.account = a.alias
WHERE
    num_tubes >= 1 AND
    billedBy.value = 'a' AND
    qcstate.publicdata = true
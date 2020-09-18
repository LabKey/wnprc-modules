/*
 * Copyright (c) 2017 LabKey Corporation
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
 * Below query is based on WNPRC's current financial system - query that resides in bloodbygrant.pl:
 * "select id, dateOnly, project.account as account, billedby.value, sum(num_tubes) as tubes
 * from study.bloodSchedule
 * where dateonly >= \'$mindate\' and dateonly <= \'$maxdate\' and qcstate.publicdata = true and billedby.value = \'a\'
 * group by dateOnly, id, project.account, billedby.value
 * order by project.account, billedby.value"
 */

PARAMETERS(StartDate TIMESTAMP, EndDate TIMESTAMP)

SELECT
  bloodSch.Id,
  bloodSch.date,
  max(bloodSch.project) AS project,
  bloodSch.project.account,
  max(bloodSch.objectid) AS sourceRecord,
  max(bloodSch.taskid) AS taskid,
  sum(bloodSch.num_tubes) AS tubes,
  bloodSch.performedby
FROM studyLinked.BloodSchedule bloodSch -- linked schema studyLinked is expected in Private folder. Use studyLinked.template.xml to create this linked schema
WHERE CAST(bloodSch.date AS date) >= CAST(StartDate AS date) AND CAST(bloodSch.date AS date) <= CAST(EndDate AS date)
AND bloodSch.qcstate.publicdata = true
AND bloodSch.billedby.value = 'a'
GROUP BY bloodSch.date, bloodSch.id, bloodSch.project.account, bloodSch.billedby.value, bloodSch.performedby
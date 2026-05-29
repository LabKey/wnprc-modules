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
--Query for the Research Ultrasounds view

SELECT ru.objectid
      ,ru.id
      ,ru.date
      ,ru.pregnancyid
      --Show the pregnancy status
      ,CASE WHEN EXISTS(SELECT 1 FROM pregnancy_outcomes po WHERE ru.pregnancyid = po.pregnancyid)
              THEN 'Pregnancy Completed'
            WHEN EXISTS(SELECT 1 FROM pregnancies p WHERE ru.pregnancyid = p.lsid)
                  THEN CONCAT(CAST((SELECT timestampdiff('SQL_TSI_DAY', p.date_conception, ru.date)
                         FROM pregnancies p
                         WHERE ru.pregnancyid = p.lsid) AS VARCHAR), ' day(s)')
            ELSE 'No Associated Pregnancy'
       END AS gestation_day
      ,ru.project
      ,res.restraintType as restraint
      ,ru.fetal_heartbeat
      ,ru.performedby
      ,ru.remark
      ,CASE
      --Show if the review is completed or not
      --This is N/A if the record was bulk uploaded
        WHEN (SELECT ur.completed
                FROM ultrasound_review ur
                WHERE ur.taskid = ru.taskid) = TRUE THEN 'Yes'
        WHEN (ru.qcstate.Label = 'Completed') THEN 'N/A (bulk upload)'
        WHEN (SELECT ur.completed
                FROM ultrasound_review ur
                WHERE ur.taskid = ru.taskid) IS FALSE THEN 'No'
        ELSE 'No'
      END AS reviewCompleted
      ,ru.taskid
  FROM research_ultrasounds ru
LEFT JOIN (SELECT restraintType, taskid FROM restraints) as res
ON ru.taskid = res.taskid
ORDER BY ru.date DESC
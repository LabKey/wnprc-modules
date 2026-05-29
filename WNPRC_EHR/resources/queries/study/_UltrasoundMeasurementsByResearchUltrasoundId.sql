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
PARAMETERS ( PARENT_RECORD_ID VARCHAR )
SELECT
  um.ultrasound_id,
  um.date,
  um.measurement_label,
  um.measurement_value,
  um.measurement_unit,
  (SELECT ROUND(AVG(um2.measurement_value), 2)
    FROM ultrasound_measurements um2
    WHERE um2.ultrasound_id = PARENT_RECORD_ID
    AND um2.measurement_name = um.measurement_name
    GROUP BY measurement_label, measurement_unit) AS measurement_averages,
  CASE WHEN EXISTS(SELECT 1 FROM pregnancies p WHERE (SELECT ru.pregnancyid FROM study.research_ultrasounds ru WHERE ru.objectid = PARENT_RECORD_ID) = p.lsid)
          THEN CONCAT(CAST((SELECT timestampdiff('SQL_TSI_DAY', p.date_conception, (SELECT ru.date FROM study.research_ultrasounds ru WHERE ru.objectid = PARENT_RECORD_ID))
                            FROM pregnancies p
                            WHERE (SELECT ru.pregnancyid FROM study.research_ultrasounds ru WHERE ru.objectid = PARENT_RECORD_ID) = p.lsid) AS VARCHAR), ' day(s)')
          ELSE 'No Associated Pregnancy'
  END AS gestation_day
FROM ultrasound_measurements um
WHERE um.ultrasound_id = PARENT_RECORD_ID
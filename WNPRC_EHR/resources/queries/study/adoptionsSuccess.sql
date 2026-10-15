/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

SELECT
    a_start.dam,
    a_start.Id,
    a_start.date AS start_date,
    a_end.date AS end_date,
    timestampdiff('SQL_TSI_DAY', a_start.date, a_end.date) AS days_adopted,
    (SELECT COUNT(*) FROM study.adoptions a_sub WHERE a_sub.dam = a_start.dam AND a_sub.type = '1' AND a_sub.result = '0' AND a_sub.date <= a_end.date) AS total_adoptions_for_dam
FROM study.adoptions a_start
JOIN study.adoptions a_end ON a_start.Id = a_end.Id AND a_start.dam = a_end.dam
WHERE a_start.type = '0'
  AND a_end.type = '1'
  AND a_end.result = '0'
  AND a_end.date = (
    SELECT MIN(a2.date)
    FROM study.adoptions a2
    WHERE a2.Id = a_start.Id
      AND a2.dam = a_start.dam
      AND a2.type = '1'
      AND a2.date > a_start.date
  )



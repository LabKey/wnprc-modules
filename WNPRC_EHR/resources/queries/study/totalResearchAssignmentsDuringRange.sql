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
PARAMETERS
    (START_DATE TIMESTAMP, END_DATE TIMESTAMP)

SELECT id
     , GROUP_CONCAT(project, ', ')       as Projects
     , GROUP_CONCAT(date, ', ')          as AssignmentDates
     , GROUP_CONCAT(enddate, ', ')       as ReleaseDates
     , GROUP_CONCAT(project.avail, ', ') as ProjectAvails
FROM study.assignment
WHERE date <= END_DATE
  AND (enddate >= START_DATE OR enddate IS NULL)
  AND (project.avail = 'r')
GROUP BY id;
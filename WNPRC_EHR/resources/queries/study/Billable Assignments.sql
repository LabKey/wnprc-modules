/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
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
 * This query displays billable assignments.  Current assignments will have a null enddate, but this
 * changes that to display as today's date.
 */

SELECT Id, project, project.research as isResearch, project.account as account, date as startdate, COALESCE (enddate, curdate()) as enddate FROM study.assignment
WHERE
(
  project.research IS TRUE
  AND
  /*
   * There are some old accounts (1991 - 1993) that don't have accounts associated.  We can disregard these.
   */
  project.account IS NOT NULL
)

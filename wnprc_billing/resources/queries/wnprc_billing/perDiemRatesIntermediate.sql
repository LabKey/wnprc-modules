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
SELECT perdiemsByDayOuter.Id,
       perdiemsByDayOuter.adate,
       perdiemsByDayOuter.edate,
       sum(effectiveDays)           AS totalDaysPerAccount,
       perdiemsByDayOuter.account,
       perdiemsByDayOuter.project,
       perdiemsByDayOuter.locations AS comment
FROM (SELECT perdiemsByDay.singleDayDate,
             perdiemsByDay.Id,
             perdiemsByDay.account,
             perdiemsByDay.project,
             perdiemsByDay.adate,
             perdiemsByDay.edate,
             perdiemsByDay.locations,
             x.accountDays,
             ROUND(CAST(1 AS DOUBLE) / x.accountDays, 2) AS effectiveDays
      FROM perdiemsByDay perdiemsByDay
      LEFT JOIN (SELECT
                       perdiemsByDay2.singleDayDate,
                       perdiemsByDay2.Id,
                       count(perdiemsByDay2.account) as accountDays
                FROM perdiemsByDay perdiemsByDay2
                GROUP BY perdiemsByDay2.singleDayDate,
                         perdiemsByDay2.Id
                ) x
      ON x.Id = perdiemsByDay.Id AND x.singleDayDate = perdiemsByDay.singleDayDate) perdiemsByDayOuter

GROUP BY perdiemsByDayOuter.Id,
         perdiemsByDayOuter.adate,
         perdiemsByDayOuter.edate,
         perdiemsByDayOuter.account,
         perdiemsByDayOuter.project,
         perdiemsByDayOuter.locations
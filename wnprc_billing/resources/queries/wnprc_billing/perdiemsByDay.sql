/*
 * Copyright (c) 2019-2026 LabKey Corporation
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
PARAMETERS(StartDate TIMESTAMP, EndDate TIMESTAMP)

-- expands account assignment date range into single day
SELECT
  *
FROM
  (SELECT
     dr.dateOnly AS singleDayDate,
     x.Id,
     x.account,
     x.project,
     x.adate,
     x.edate,
     x.locations
  FROM
  (
    SELECT
     CAST(i.date as date) as dateOnly
     FROM (
          SELECT timestampadd('SQL_TSI_DAY', i.value, CAST(COALESCE(CAST(StartDate as date), curdate()) AS TIMESTAMP)) as date
          FROM ldk.integers i
          WHERE i.value < (TIMESTAMPDIFF('SQL_TSI_DAY', EndDate, StartDate)+1)
     ) i
  )dr --version of ldk.dateRange

  LEFT JOIN

   (SELECT
     pds.Id,
     pds.account,
     pds.project,
     pds.adate,
     pds.edate,
     group_concat(pds.location, ',') AS locations
    FROM wnprc_billing.perDiems pds
    GROUP BY
     pds.Id,
     pds.account,
     pds.project,
     pds.adate,
     pds.edate
   ) x

   ON dr.dateOnly between x.adate AND x.edate) pbd

--don't charge a per diem for an animal for any day that it's on
--a project with a 'ph' availability code (ehr.project.avail)
WHERE NOT EXISTS(
    SELECT 1
    FROM studyLinked.assignment asgnmt
    WHERE pbd.Id = asgnmt.Id
      AND CAST(pbd.singleDayDate AS DATE) >= CAST(asgnmt.date AS DATE)
      AND (CAST(pbd.singleDayDate AS DATE) <= CAST(asgnmt.enddate AS DATE) OR asgnmt.enddate IS NULL)
      AND asgnmt.project.avail = 'ph'
    )
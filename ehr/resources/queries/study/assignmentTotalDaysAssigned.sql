/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--TODO: verify single day assignments
SELECT

T1.id,
T1.year,

--T1.StartYear,
--T1.EndYear,



convert(SUM(
CASE
  WHEN (T1.year > T1.startYear AND T1.year < T1.EndYear) THEN
    365
  WHEN (T1.year = T1.startYear AND T1.year < T1.EndYear) THEN
    TIMESTAMPDIFF('SQL_TSI_DAY', T1.date, convert('12-12-'||T1.stringYear, DATE))
  WHEN (T1.year > T1.startYear AND T1.year = T1.EndYear) THEN
    TIMESTAMPDIFF('SQL_TSI_DAY', CAST('01-01-'||T1.stringYear as DATE), T1.enddate)
  WHEN (T1.year = T1.startYear AND T1.year = T1.EndYear) THEN
    TIMESTAMPDIFF('SQL_TSI_DAY', T1.date, T1.enddate)
  ELSE
    9999
END
), integer)
AS TotalDaysAssigned,



FROM (
SELECT

a.id,
i.year,
cast(i.year AS VARCHAR) as stringYear,

a.date,
coalesce(a.enddate, now()) AS enddate,

convert(year(a.date), 'INTEGER') as StartYear,
convert(year(coalesce(a.enddate, now())), 'INTEGER') as EndYear,

--TIMESTAMPDIFF('SQL_TSI_DAY', a.date, coalesce(a.enddate, curdate())) AS TotalDaysAssigned,

FROM (SELECT convert(year(curdate()), 'INTEGER')-i.value as Year FROM ldk.integers i WHERE i.value <=5) i
LEFT JOIN study.assignment a
  ON (
  i.Year >= year(a.date)
  AND i.year <= year(coalesce(a.enddate, curdate()))
  AND (a.project.avail = 'n' OR a.project.avail = 'r')
  )
  WHERE a.qcstate.publicdata = true
) T1

GROUP BY T1.id, T1.year
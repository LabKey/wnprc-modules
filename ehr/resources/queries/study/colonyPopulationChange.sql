/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
PARAMETERS(StartDate TIMESTAMP, EndDate TIMESTAMP)

SELECT
  T1.id,
--   T1.id.dataset.demographics.species as species,
  'Births' AS Category,
  T1.date,
  convert(year(T1.date), integer) AS Year,

FROM study.Birth T1
WHERE T1.date IS NOT NULL
and cast(COALESCE(STARTDATE, '1900-01-01') as date) <= T1.date and  cast(COALESCE(ENDDATE, curdate()) as date) >= cast(T1.date as date)

UNION ALL

SELECT
  T2.id,
--   T2.id.dataset.demographics.species,
  'Arrivals' AS Category,
  max(T2.date),
  convert(year(max(T2.date)), INTEGER) AS Year,

FROM study.Arrival T2
WHERE T2.date IS NOT NULL
AND T2.qcstate.publicdata = true
and cast(COALESCE(STARTDATE, '1900-01-01') as date) <= T2.date and  cast(COALESCE(ENDDATE, curdate()) as date) >= cast(T2.date as date)
group by id

UNION ALL

SELECT
  T3.id,
--   T3.id.dataset.demographics.species,
  'Departures' AS Category,
  max(T3.Date),
  convert(year(max(T3.date)), INTEGER) AS Year,

FROM study.Departure T3
WHERE T3.date IS NOT NULL
AND T3.qcstate.publicdata = true
and cast(COALESCE(STARTDATE, '1900-01-01') as date) <= T3.date and  cast(COALESCE(ENDDATE, curdate()) as date) >= cast(T3.date as date)
group by id

UNION ALL

SELECT
  T4.id,
--   T4.id.dataset.demographics.species,
  'Deaths' AS Category,
  T4.date,
  convert(year(T4.date), INTEGER) AS Year,

FROM study.Deaths T4
WHERE T4.date IS NOT NULL
and (t4.notAtCenter is null or t4.notAtCenter = false)
and cast(COALESCE(STARTDATE, '1900-01-01') as date) <= T4.date and  cast(COALESCE(ENDDATE, curdate()) as date) >= cast(T4.date as date)

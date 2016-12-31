/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  d.Id AS Id,

  T1.MostRecentArrival,

  T2.EarliestArrival,

  coalesce(T2.EarliestArrival, d.birth) as Center_Arrival,

FROM study.demographics d


--date of most recent arrival
LEFT JOIN
  (select T1.Id, max(T1.date) as MostRecentArrival FROM study.arrival T1 WHERE T1.qcstate.publicdata = true GROUP BY T1.Id) T1
  ON (T1.Id = d.Id)

--date of first arrival
LEFT JOIN
  (select T1.Id, min(T1.date) as EarliestArrival FROM study.arrival T1 WHERE T1.qcstate.publicdata = true GROUP BY T1.Id) T2
  ON (T2.Id = d.Id)
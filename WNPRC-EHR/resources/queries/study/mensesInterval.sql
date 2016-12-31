/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

m.lsid,
m.Id,
m.date,
m2.PrevDate,
timestampdiff('SQL_TSI_DAY', m2.PrevDate, m.date) AS Interval

FROM study.menses m
  --Find the next most recent menses date
  LEFT JOIN
    (SELECT T2.Id, T2.date, max(T1.date) as PrevDate
      FROM study.menses T1 JOIN study.menses T2 ON (T1.menses = true AND T2.menses=true AND T1.Id = T2.Id AND T1.date < T2.date)
      WHERE t1.qcstate.publicdata = true AND t2.qcstate.publicdata = true
      GROUP BY T2.Id, T2.date) m2
      ON (m.Id = m2.Id AND m.date = m2.date)

WHERE m.qcstate.publicdata = true
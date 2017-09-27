/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query contains a handful of calculated fields for the weights table
--it is designed to be joined into weights using lsid

SELECT
  w.lsid,
  w.Id,
  w.date,
  w.weight AS CurWeight,
  w2.PrevDate,
  w3.weight AS PrevWeight,
  Round(((w.weight - w3.weight) * 100 / w.weight), 1) AS PctChange,
  Abs(Round(((w.weight - w3.weight) * 100 / w.weight), 1)) AS AbsPctChange,
  timestampdiff('SQL_TSI_DAY', w3.date, w.date) AS Interval,
  w.qcstate

FROM study.weight w
  --Find the next most recent weight date before this one
  JOIN
    (SELECT T2.Id, T2.date, max(T1.date) as PrevDate
      FROM study.weight T1
      JOIN study.weight T2 ON (T1.Id = T2.Id AND T1.date < T2.date)
      WHERE t1.qcstate.publicdata = true AND t2.qcstate.publicdata = true
      GROUP BY T2.Id, T2.date) w2
      ON (w.Id = w2.Id AND w.date = w2.date)

  --and the weight associated with that date
  JOIN study.weight w3
      ON (w.Id = w3.Id AND w3.date = w2.prevdate)

--   --Find the current weight date
--   JOIN
--     (SELECT t1.Id, max(T1.date) as LastWeightDate
--       FROM study.weight T1
--       WHERE t1.qcstate.publicdata = true
--       GROUP BY T1.Id) w4
--       ON (w.Id = w4.Id)
--
--
--   JOIN study.weight w5
--       ON (w5.Id = w.Id AND w5.date = w4.LastWeightDate)

WHERE
w.qcstate.publicdata = true
AND w3.qcstate.publicdata = true

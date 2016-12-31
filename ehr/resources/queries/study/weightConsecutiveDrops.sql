/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query contains a handful of calculated fields for the weights table
--it is designed to be joined into weights using lsid

SELECT
  w.lsid,
  w.Id,
  w.date,
  w.weight AS curWeight,
  
  pd1.PrevDate as prevDate1,
  pw1.weight AS prevWeight1,

  Round(((w.weight - pw1.weight) * 100 / w.weight), 1) AS pctChange1,
  timestampdiff('SQL_TSI_DAY', pw1.date, w.date) AS interval1,

  pd2.PrevDate as PrevDate2,
  pw2.weight AS PrevWeight2,
  Round(((pw1.weight - pw2.weight) * 100 / pw1.weight), 1) AS PctChange2,
  timestampdiff('SQL_TSI_DAY', pw2.date, pw1.date) AS Interval2,

FROM study.weight w
  --Find the next most recent weight date before this one
  JOIN
    (SELECT T2.Id, T2.date, max(T1.date) as PrevDate
      FROM study.weight T1
      JOIN study.weight T2 ON (T1.Id = T2.Id AND T1.date < T2.date)
      WHERE t1.qcstate.publicdata = true AND t2.qcstate.publicdata = true
      GROUP BY T2.Id, T2.date) pd1
      ON (w.Id = pd1.Id AND w.date = pd1.Date)

  --and the weight associated with that date
  JOIN study.weight pw1
      ON (w.Id = pw1.Id AND pw1.date = pd1.prevdate AND pw1.qcstate.publicdata = true)

  --then find the next most recent date
  LEFT JOIN
    (SELECT T2.Id, T2.date, max(T1.date) as PrevDate
      FROM study.weight T1
      JOIN study.weight T2 ON (T1.Id = T2.Id AND T1.date < T2.date)
      WHERE t1.qcstate.publicdata = true AND t2.qcstate.publicdata = true
      GROUP BY T2.Id, T2.date
    ) pd2
    ON (pd1.Id = pd2.Id AND pd1.PrevDate = pd2.date)

  --and the weight associated with that date
  JOIN study.weight pw2
      ON (w.Id = pw2.Id AND pw2.date = pd2.prevdate AND pw2.qcstate.publicdata = true)


WHERE
w.qcstate.publicdata = true

AND pd1.date is not null
AND pd2.date is not null

--only include drops
AND w.weight < pw1.weight
AND pw1.weight < pw2.weight
AND ((w.weight - pw2.weight) * 100 / w.weight) < -3.0
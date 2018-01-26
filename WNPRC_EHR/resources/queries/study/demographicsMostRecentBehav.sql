/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

bh.id,
bh.MostRecentBehavDate,
timestampdiff('SQL_TSI_DAY', bh.MostRecentBehavDate, now()) AS DaysSinceBehav,

-- t2.weight as MostRecentWeight,
null as behavField,
-- could also be performed as a subquery
  (
    SELECT bh2.Behavior
    FROM study.BehaviorAbstract bh2
    WHERE bh.id=bh2.id AND bh.MostRecentBehavDate=bh2.date
   ) AS MostRecentBehav

FROM (
SELECT
  bh.Id AS Id,
  max(bh.date) AS MostRecentBehavDate,

FROM study.BehaviorAbstract bh
WHERE bh.qcstate.publicdata = true and bh.Behavior is not null
GROUP BY bh.id
) bh

--NOTE: altered to a subselect to avoid duplicate entries from weights with identical time
-- --find the most recent weight associated with that date
-- LEFT JOIN study.weight T2
--   ON (w.MostRecentWeightDate = t2.date AND w.Id = t2.Id)
--
-- WHERE t2.qcstate.publicdata = true

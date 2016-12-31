/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

w.id,
w.MostRecentWeightDate,
timestampdiff('SQL_TSI_DAY', w.MostRecentWeightDate, now()) AS DaysSinceWeight,

null as weightField,
--NOTE: we need to be careful in case duplicate weights are entered on the same time
cast((
    SELECT round(cast(AVG(w2.weight) as double), 2) AS _expr
    FROM study.weight w2
    WHERE w.id=w2.id AND w.MostRecentWeightDate=w2.date
) as double) AS MostRecentWeight

FROM (
SELECT
  w.Id AS Id,
  max(w.date) AS MostRecentWeightDate,

FROM study.weight w
WHERE w.qcstate.publicdata = true and w.weight is not null
GROUP BY w.id
) w

--NOTE: altered to a subselect to avoid duplicate entries from weights with identical time
-- --find the most recent weight associated with that date
-- LEFT JOIN study.weight T2
--   ON (w.MostRecentWeightDate = t2.date AND w.Id = t2.Id)
--
-- WHERE t2.qcstate.publicdata = true
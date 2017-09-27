/*
 * Copyright (c) 2011-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
 i.Id,
 i.year,
 i.monthName,
 i.monthNum,
 i.day,
 group_concat(DISTINCT i.menses) as menses

FROM (

SELECT
  i.id,
  i.date,
  convert(year(i.date), integer) as Year,
  monthname(i.date) AS monthName,
  convert(month(i.date), integer) AS monthNum,
  --convert(week(i.date), integer) as Week,
  convert(dayofmonth(i.date), integer) as Day,
  i.menses

FROM study.irregularObs i
WHERE i.menses is not NULL
--AND i.qcstate.publicdata = true

) i

GROUP BY i.id, i.year, i.monthName, i.monthNum, i.day
PIVOT menses BY day
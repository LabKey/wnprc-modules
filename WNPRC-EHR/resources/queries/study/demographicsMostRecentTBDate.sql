/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

 --NOTE: this is joined to demographics such that animals never tested for TB
 --will still get a value for MonthsSinceLastTB
select
  d.Id,
  T2.lastDate as MostRecentTBDate,
  case
    WHEN T2.lastDate IS NULL THEN 9999
    ELSE age_in_months(T2.lastDate, now())
  END AS MonthsSinceLastTB,
  (select group_concat(tb.eye) as eyeTested FROM study.tb tb WHERE tb.id = d.id and tb.date = T2.lastdate) as eyeTested,
  null as "24H",
  null as "48H",
  null as "72H"

from study.demographics d

LEFT JOIN (select id, max(date) as lastDate from study.tb WHERE tb.qcstate.publicdata = true group by id) T2
ON (d.id = t2.id)






/*
 * Copyright (c) 2011-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
select
b.date,
CASE
  WHEN dayofweek(b.date) = 1 THEN 'Sunday'
  WHEN dayofweek(b.date) = 2 THEN 'Monday'
  WHEN dayofweek(b.date) = 3 THEN 'Tuesday'
  WHEN dayofweek(b.date) = 4 THEN 'Wednesday'
  WHEN dayofweek(b.date) = 5 THEN 'Thursday'
  WHEN dayofweek(b.date) = 6 THEN 'Friday'
  WHEN dayofweek(b.date) = 7 THEN 'Saturday'
END as dayOfWeek,

group_concat(b.requestors) as requestors,
sum(b.total) as totalDraws

from (
  select
  cast(b.date as date) as date,
  chr(10) || b.requestid.notify1.DisplayName || ' (' || count(distinct b.id) || ')' as requestors,
  count(distinct b.id) as total

  from study."Blood Draws" b
  where (b.qcstate.metadata.DraftData = true OR b.qcstate.publicdata = true)
  group by b.requestid.notify1.DisplayName, cast(b.date as date)
) b
group by b.date
/*
 * Copyright (c) 2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
select b.id, b.score, b.date as "Date of Last Score"
from  study.demographics d,  (
  select id, max(date) as lastDate
  from study."Body Condition" group by id
) as x inner join study."Body Condition" as b on b.id = x.id and b.date = x.lastDate

WHERE b.id = d.id and d.calculated_status = 'Alive'

/*
 * Copyright (c) 2011-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

select
b.id,
b.date,
group_concat(distinct b.billedby) as billedby,
sum(b.quantity) as quantity,
b.taskid,
count(*) as total_records
from study."Blood Draws" b
group by b.id, b.date, b.taskid


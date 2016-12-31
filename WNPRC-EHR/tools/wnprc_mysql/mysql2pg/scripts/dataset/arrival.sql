/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
lower(id) as Id,
FixDateTime(date, time) AS Date,
(source) AS source,
FixNewlines(remark) AS remark,
NULL as parentid,
ts,
uuid AS objectid
FROM arrival
WHERE length(id) > 1

UNION ALL

select
lower(a.id) as Id,
FixDate(a.arrivedate) as date,
null as source,
null as remark,
null as parentid,
a.ts,
a.uuid as objectid
from abstract a
LEFT JOIN arrival a1 on (a1.id = a.id)
where a.arrivedate is not null and a1.date is null
AND length(a.id) > 1
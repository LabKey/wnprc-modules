/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
lower(id) as Id,
FixDateTime(date, time) AS Date,
authorize,
destination,
FixNewlines(remark) AS remark,
null as parentid,
ts,
uuid AS objectid
FROM departure

WHERE ts > ?
AND length(id) > 1

UNION ALL

select
lower(a.id) as Id,
FixDate(a.departdate) as date,
null as authorize,
null as destination,
null as remark,
null as parentid,
a.ts,
a.uuid as objectid
from abstract a
LEFT JOIN departure a1 on (a1.id = a.id)
where a.departdate is not null and a1.date is null
AND a.ts > ?
AND length(a.id) > 1
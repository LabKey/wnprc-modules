/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
lower(id) as Id,
FixDate(date) AS Date,
sex as gender,
weight,
FixDateTime(wdate, wtime) AS wdate,
lower(dam) as dam,
lower(sire) as sire,
room,
cage,
cond,
origin,
conception,
type,
FixNewlines(remark) AS remark,
null as parentid,
ts,
uuid AS objectid

FROM birth

WHERE length(id) > 1
AND ts > ?


-- UNION ALL
--
-- select
-- lower(a.id) as Id,
-- FixDate(a.birth) as date,
-- a.sex as gender,
-- null as weight,
-- null as wdate,
-- a.dam,
-- a.sire,
-- null as room,
-- null as cage,
-- null as cond,
-- null as origin,
-- null as conception,
-- null as type,
-- null as remark,
-- null as parentid,
-- a.ts,
-- a.uuid as objectid
-- from abstract a
-- LEFT JOIN birth a1 on (a1.id = a.id)
-- where a.birth is not null and a1.date is null
-- AND a.ts > ?
-- AND length(a.id) > 1
/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/*SET GLOBAL group_concat_max_len = 4000;*/

SELECT
lower(id) as Id,
FixDateTime(date, time) AS Date,
max(ts) as ts,
uuid AS objectid
FROM surghead s
WHERE length(s.id) > 1
GROUP BY s.id, s.date, s.time, s.age, s.inves, s.pno, s.surgeon, s.endtime, s.enddate
/*HAVING max(ts) > ?*/

UNION ALL

SELECT

lower(id) as Id,
FixDate(date) AS Date,
ts,
uuid AS objectid
FROM necropsyhead n
WHERE length(id) > 1
GROUP BY n.id, n.date, n.caseno, n.account

/*HAVING ts > ?*/

UNION ALL

SELECT
lower(id) as Id,
FixDate(date) AS Date,
max(ts) as ts,
uuid AS objectid
FROM biopsyhead b
WHERE length(id) > 1

GROUP BY b.id, b.date, b.caseno, b.account
/*HAVING max(ts) > ?*/



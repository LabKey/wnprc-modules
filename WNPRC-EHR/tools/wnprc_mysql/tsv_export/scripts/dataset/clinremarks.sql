/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
lower(id) as Id,
Date,
pno as project,
userid,
SUBSTR(remark,1,50) as remark,
ts, objectid,
parentid,
category
FROM

(

SELECT
id,
FixDateTime(date, time) AS Date,
(pno) AS pno,
(userid) AS userid,
FixNewlines(left(remark, 4000)) as remark,
ts, uuid AS objectid,
(select UUID from clinhead t2 WHERE t1.id=t2.id AND t1.date=t2.date AND t1.time=t2.time AND t1.pno=t2.pno GROUP BY t1.uuid limit 1) as parentid,
'Clinical' AS category
FROM clintrem t1
WHERE id IS NOT NULL AND id != '' AND remark != '' AND remark IS NOT NULL and (pno REGEXP '^[0-9]+$' OR pno IS NULL)
/*
UNION ALL

SELECT id,
FixDateTime(date, time) AS Date,
(pno) AS pno,
NULL as userid,
remark,
ts, uuid AS objectid,
(select UUID from behavehead b2 WHERE b1.id=b2.id AND b1.date=b2.date AND b1.time=b2.time GROUP BY b1.id,b1.date,b1.time limit 1) as parentid,
'Behavior' AS category
FROM behavetrem b1
*/
UNION ALL

/*
SELECT id,
FixDateTime(date, time) AS Date,
(pno) AS pno,
NULL as userid,
FixNewlines(remark) as remark,
ts, uuid AS objectid,
(select UUID from hormhead h2 WHERE h1.id=h2.id AND h1.date=h2.date AND h1.time=h2.time GROUP BY h1.id,h1.date,h1.time limit 1) as parentid,
'Hormone' AS category
FROM hormtrem h1
WHERE remark != '' AND remark IS NOT NULL

UNION ALL
*/


SELECT id,
FixDateTime(date, time) AS Date,
(pno) AS pno,
(surgeon) AS userid,
FixNewlines(remark) as remark,
ts, uuid AS objectid,
(select UUID from surghead s2 WHERE s1.id=s2.id AND s1.date=s2.date AND s1.time=s2.time AND s1.pno=s2.pno GROUP BY s1.uuid limit 1) as parentid,
'Surgery' AS category
FROM surghead s1
WHERE id IS NOT NULL AND id != '' AND remark != '' AND remark IS NOT NULL AND (pno REGEXP '^[0-9]+$' OR pno IS NULL)

UNION ALL

SELECT
id,
FixDate(date) AS Date,
NULL as pno,
NULL as userid,
FixNewlines(remark) as remark,
ts, uuid AS objectid,
(select UUID from necropsyhead n2 WHERE n1.id=n2.id AND n1.date=n2.date AND n1.caseno=n2.caseno GROUP BY n1.uuid limit 1) as parentid,
'Necropsy' AS category
FROM necropsyhead n1
WHERE id IS NOT NULL AND id != '' AND remark != '' AND remark IS NOT NULL

UNION ALL

SELECT
id,
FixDate(date) AS Date,
NULL as pno,
NULL as userid,
FixNewlines(remark) AS remark,
ts, uuid AS objectid,
(select UUID from biopsyhead n2 WHERE n1.id=n2.id AND n1.date=n2.date AND n1.caseno=n2.caseno GROUP BY n1.uuid limit 1) as parentid,
'Biopsy' AS category
FROM biopsyhead n1
WHERE id IS NOT NULL AND id != '' AND remark != '' AND remark IS NOT NULL

) x

/*
WHERE
(x.parentid NOT LIKE '%,%' or x.parentid is null)
*/

/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT LOWER(id) AS Id, FixDateTime(date, time) AS Date, (pno) AS project, (x.code) AS code,
(amount) AS amount, (units) AS units, (route) AS route,
FixDateTime(date, coalesce(BeginTime, time)) AS begintime,
date(CASE
  WHEN EndTime is null THEN null
  WHEN EndTime='' THEN null
  ELSE FixDateTime(date, coalesce(EndTime, time))
END) AS endtime,
FixNewlines(remark) AS remark, category,
x.ts, x.uuid AS objectid, parentid,
s1.meaning
FROM

(

SELECT id, date, time, code, amount,units, route, FixBadTime(time2) as BeginTime, null as EndTime, 'clindrug' AS category, ts, uuid,
(select UUID as uuid from clinhead t2 WHERE t1.id=t2.id AND t1.date=t2.date AND t1.time=t2.time AND (t1.pno=t2.pno OR t1.pno IS NULL) GROUP BY t1.uuid) as parentid,
(select group_concat(DISTINCT pno) as pno from clinhead t2 WHERE t1.id=t2.id AND t1.date=t2.date AND t1.time=t2.time AND (t1.pno=t2.pno OR t1.pno IS NULL) GROUP BY t1.uuid) as pno,
-- (select group_concat(distinct remark SEPERATOR ";") as remark from clintrem t2 WHERE t1.id=t2.id AND t1.date=t2.date AND t1.time=t2.time AND (t1.pno=t2.pno OR t1.pno is null) AND remark is not null and remark != '' AND remark not like "%s/o%" AND remark not like '%mens.%' AND remark not like '%blood draw%' AND userid is null GROUP BY t1.uuid) as remark
null as remark
FROM clindrug t1


UNION ALL

SELECT h1.id, h1.date,h1.time, code, amount,units, route, FixBadTime(time2) as BeginTime, null as EndTime, 'hormdrug' AS category, h1.ts as ts, h1.uuid,
(select UUID as uuid from hormhead t2 WHERE h1.id=t2.id AND h1.date=t2.date AND h1.time=t2.time AND (h1.pno=t2.pno OR h1.pno is null) GROUP BY h1.uuid) as parentid,
(select group_concat(DISTINCT pno) as pno from hormhead t2 WHERE h1.id=t2.id AND h1.date=t2.date AND h1.time=t2.time AND (h1.pno=t2.pno OR h1.pno is null) GROUP BY h1.uuid) as pno,
(select group_concat(distinct remark) as remark from hormtrem t2 WHERE h1.id=t2.id AND h1.date=t2.date AND h1.time=t2.time AND (h1.pno=t2.pno OR h1.pno is null) GROUP BY h1.uuid) as remark
FROM hormdrug h1
/*left join hormtrem h2 on (h1.id=h2.id AND (h1.pno=h2.pno OR h1.pno is null) AND h1.date=h2.date AND h1.time=h2.time AND h2.remark != '')*/


UNION ALL

SELECT id, date,time, code, amount,units, route, null as BeginTime, null as EndTime, 'surgmed' AS category, ts, uuid,
(select UUID from surghead t2 WHERE t1.id=t2.id AND t1.date=t2.date AND t1.time=t2.time GROUP BY t1.uuid) as parentid,
(select pno from surghead t2 WHERE t1.id=t2.id AND t1.date=t2.date AND t1.time=t2.time GROUP BY t1.uuid) as pno,
remark
FROM surgmed t1


UNION ALL

SELECT id, date,time, code, amount,units, route, null as BeginTime, null as EndTime, 'surganes' AS category, ts, uuid,
(select UUID from surghead t2 WHERE t1.id=t2.id AND t1.date=t2.date AND t1.time=t2.time GROUP BY t1.uuid) as parentid,
(select pno from surghead t2 WHERE t1.id=t2.id AND t1.date=t2.date AND t1.time=t2.time GROUP BY t1.uuid) as pno,
remark
FROM surganes t1


UNION ALL

SELECT id, date, time, code, amount, units, route,
FixBadTime(begintime) AS begintime,
FixBadTime(endtime) AS endtime, 'surgfluid' as category, ts, uuid,
(select UUID from surghead t2 WHERE t1.id=t2.id AND t1.date=t2.date AND t1.time=t2.time GROUP BY t1.id,t1.date,t1.time limit 1) as parentid,
(select pno from surghead t2 WHERE t1.id=t2.id AND t1.date=t2.date AND t1.time=t2.time GROUP BY t1.uuid) as pno,
null as remark
FROM surgfluid t1


        ) x
JOIN snomed s1 on x.code=s1.code



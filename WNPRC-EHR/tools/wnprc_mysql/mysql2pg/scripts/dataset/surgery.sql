/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, now() AS Date, age, null as inves, pno as project, null as surgeon,
FixDateTime(enddate, endtime) AS enddate, major,
/*FixNewlines(remark) AS remark,*/
max(ts) as ts, uuid AS objectid
FROM surghead s
GROUP BY s.id, s.date, s.time, s.age, s.inves, s.pno, s.surgeon, s.endtime, s.enddate




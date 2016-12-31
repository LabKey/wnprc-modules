/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, FixDateTime(date, time) AS Date, age, inves, pno as project, surgeon,
FixDateTime(enddate, endtime) AS enddate, major,
/*FixNewlines(remark) AS remark,*/
max(ts) as ts, uuid AS objectid
FROM surghead s
WHERE length(s.id) > 1
GROUP BY s.id, s.date, s.time, s.age, s.inves, s.pno, s.surgeon, s.endtime, s.enddate
HAVING max(ts) > ?



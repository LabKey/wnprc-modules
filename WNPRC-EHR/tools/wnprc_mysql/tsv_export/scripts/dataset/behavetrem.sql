/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, FixDateTime(date, time) AS Date, (pno) AS project, FixNewlines(remark) as remark, ts, uuid AS objectid,
/* (select group_concat(UUID) from behavehead b2 WHERE b1.id=b2.id AND b1.date=b2.date AND b1.time=b2.time GROUP BY b1.id,b1.date,b1.time) as parentid */
null as parentid
FROM behavetrem b1

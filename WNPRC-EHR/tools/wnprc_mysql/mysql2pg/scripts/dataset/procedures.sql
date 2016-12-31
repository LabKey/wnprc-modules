/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, FixDateTime(date, time) AS Date, (p.code) AS code,
s1.meaning,
p.ts, p.uuid AS objectid,
(select UUID from surghead t2 WHERE p.id=t2.id AND p.date=t2.date AND p.time=t2.time GROUP BY p.id,p.date,p.time limit 1) as parentid

FROM surgproc p
LEFT OUTER JOIN snomed s1 on s1.code=p.code





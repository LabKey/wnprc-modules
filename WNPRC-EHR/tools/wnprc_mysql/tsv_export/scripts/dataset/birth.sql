/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, FixDate(date) AS Date, sex as gender, weight, FixDateTime(wdate, wtime) AS wdate, lower(dam) as dam, lower(sire) as sire, room, cage, cond, origin, conception, type, FixNewlines(remark) AS remark, null as parentid,
ts, uuid AS objectid

FROM birth


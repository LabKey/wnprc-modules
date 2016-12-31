/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, FixDateTime(idate, itime) AS Date, room, cage, cond, FixDateTime(odate, otime) AS odate,
ts, uuid AS objectid
FROM housing


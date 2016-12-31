/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, FixDateTime(date, time) AS Date, authorize, destination, FixNewlines(remark) AS remark,
     ts, uuid AS objectid, null as parentid
FROM departure


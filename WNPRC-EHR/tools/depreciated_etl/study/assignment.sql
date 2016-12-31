/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, FixDate(adate) AS Date, pno as project, FixDate(rdate) AS enddate, NULL as parentid,
ts, uuid AS objectid
FROM assignment
WHERE ts > ?
AND length(id) > 1
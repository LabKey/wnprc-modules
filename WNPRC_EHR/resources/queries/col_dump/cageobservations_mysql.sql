/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
a.cage,
a.date,
t2.ts,
null as objectid,
t2.objectid as key2
FROM ehr.cage_observations a
full join col_dump.cagenotes t2
on a.objectid = t2.objectid
WHERE (t2.objectid is null or a.objectid is null) AND a.taskid is null
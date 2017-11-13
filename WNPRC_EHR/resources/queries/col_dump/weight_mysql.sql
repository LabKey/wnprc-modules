/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
a.id,
a.date,
a.ts,
a.objectid,
t2.objectid as key2
FROM study.weight	 a
full join col_dump.weight	 t2
on a.objectid = t2.objectid
WHERE (t2.objectid is null or a.objectid is null  or a.ts != t2.ts) AND (a.ts is not null OR a.id is null)
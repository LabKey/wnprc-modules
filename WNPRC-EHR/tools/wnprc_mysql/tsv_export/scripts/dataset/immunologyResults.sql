/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, FixDate(date) AS Date, upper(testid) as testid, Results as result, units,
ts, objectid, runId

FROM

(

SELECT
id,
date,
'CD3' as TestID,
cd3 as Results,
null as Units,
concat(uuid,'cd3') as objectid, ts,
uuid as runId
FROM immunores
where cd3 is not null and cd3 != ""


UNION ALL

SELECT
id,
date,
'CD20' as TestID,
cd20 as Results,
null as Units,
concat(uuid,'cd20') as objectid, ts,
uuid as runId
FROM immunores
where cd20 is not null and cd20 != ""


UNION ALL

SELECT
id,
date,
'CD4' as TestID,
cd4 as Results,
null as Units,
concat(uuid,'cd4') as objectid, ts,
uuid as runId
FROM immunores
where cd4 is not null and cd4 != ""


UNION ALL

SELECT
id,
date,
'CD8' as TestID,
cd8 as Results,
null as Units,
concat(uuid,'cd8') as objectid, ts,
uuid as runId
FROM immunores
where cd8 is not null and cd8 != ""


) x


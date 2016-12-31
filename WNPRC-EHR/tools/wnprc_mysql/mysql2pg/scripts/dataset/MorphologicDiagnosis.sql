/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
lower(id) as Id,
FixDate(date) AS Date,
b.ts,
b.uuid AS objectid

FROM biopsydiag b
LEFT OUTER JOIN snomed s1 ON s1.code=b.code
WHERE length(b.id) > 1

/*HAVING parentid NOT LIKE "%,%"*/

UNION ALL

SELECT
lower(id) as Id,
FixDate(date) AS Date,
n.ts,
n.uuid AS objectid
FROM necropsydiag n
LEFT JOIN snomed s1 on n.code =s1.code
WHERE length(n.id) > 1


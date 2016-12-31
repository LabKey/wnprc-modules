/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
lower(id) as Id,
FixDate(date) AS Date,
seq1,
seq2,
(SELECT group_concat(DISTINCT uuid) as uuid FROM (SELECT * FROM biopsyhead GROUP BY id, date, caseno, account) b2 WHERE b.id = b2.id AND b.date = b2.date) AS parentid,

(b.code) AS process,
s1.meaning,
b.ts,
b.uuid AS objectid

FROM biopsydiag b
LEFT OUTER JOIN snomed s1 ON s1.code=b.code
WHERE b.ts > ?
AND length(b.id) > 1

/*HAVING parentid NOT LIKE "%,%"*/

UNION ALL

SELECT
lower(id) as Id,
FixDate(date) AS Date,
(seq1) AS seq1,
(seq2) AS seq2,
(SELECT group_concat(distinct uuid) as uuid FROM necropsyhead n2 WHERE n.id = n2.id AND n.date = n2.date limit 1) AS parentid,

(n.code) AS process,
s1.meaning,
n.ts,
n.uuid AS objectid
FROM necropsydiag n
LEFT JOIN snomed s1 on n.code =s1.code
WHERE n.ts > ? AND length(n.id) > 1

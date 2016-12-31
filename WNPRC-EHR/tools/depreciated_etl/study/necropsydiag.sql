/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, FixDate(date) AS Date,
(SELECT group_concat(distinct uuid) as uuid FROM necropsyhead n2 WHERE n.id = n2.id AND n.date = n2.date limit 1) AS parentid,
(seq1) AS seq1, (seq2) AS seq2, (n.code) AS process,
s1.meaning,
n.ts, n.uuid AS objectid
FROM necropsydiag n
LEFT JOIN snomed s1 on n.code =s1.code
WHERE n.ts > ? AND length(n.id) > 1
/*HAVING parentid NOT LIKE "%,%"*/

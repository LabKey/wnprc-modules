/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, FixDate(date) AS Date, source, result as organism, FixNewlines(remark) AS remark, antibiotic, sensitivity,
b.uuid as runId,
b.uuid as parentId,
b.ts, b.uuid AS objectid,
s1.meaning as sourceMeaning,
s2.meaning as resultMeaning,
s3.meaning as antibioticMeaning
FROM bacteriology b
LEFT OUTER JOIN snomed s1 ON s1.code=b.source
LEFT OUTER JOIN snomed s2 ON s2.code = b.result
LEFT OUTER JOIN snomed s3 ON s3.code=b.antibiotic
WHERE b.ts > ?
AND length(b.id) > 1
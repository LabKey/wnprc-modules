/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, FixDate(date) AS Date, upper(testid) as testid, stringResults, result, units, remark, method, quantity,
     ts, objectid, runid, runId as parentId

FROM

(

SELECT
id,
date,
'BILIRUBIN' as TestID,
bilirubin as stringResults,
null as result,
null as Units,
null as remark,
quantity,
method,
concat(uuid,'bilirubin') as objectid, ts,
uuid as runId
FROM urine
where bilirubin is not null and bilirubin != ""
AND ts > ?
AND length(id) > 1

UNION ALL

SELECT
id,
date,
'KETONE' as TestID,
ketone as stringResults,
null as result,
null as Units,
null as remark,
quantity,
method,
concat(uuid,'ketone') as objectid, ts,
uuid as runId
FROM urine
where ketone is not null and ketone != ""
AND ts > ?
AND length(id) > 1


UNION ALL

SELECT
id,
date,
'SP_GRAVITY' as TestID,
null as stringResults,
sp_gravity as result,
null as Units,
null as remark,
quantity,
method,
concat(uuid,'sp_gravity') as objectid, ts,
uuid as runId
FROM urine
where sp_gravity is not null and sp_gravity != ""
AND ts > ?
AND length(id) > 1

UNION ALL

SELECT
id,
date,
'BLOOD' as TestID,
blood as stringResults,
null as result,
null as Units,
null as remark,
quantity,
method,
concat(uuid,'blood') as objectid, ts,
uuid as runId
FROM urine
where blood is not null and blood != ""
AND ts > ?
AND length(id) > 1

UNION ALL

SELECT
id,
date,
'PH' as TestID,
null as stringResults,
ph as result,
null as Units,
null as remark,
quantity,
method,
concat(uuid,'ph') as objectid, ts,
uuid as runId
FROM urine
where ph is not null and ph != ""
AND ts > ?
AND length(id) > 1

UNION ALL

SELECT
id,
date,
'PROTEIN' as TestID,
protein as stringResults,
null as result,
null as Units,
null as remark,
quantity,
method,
concat(uuid,'protein') as objectid, ts,
uuid as runId
FROM urine
where protein is not null and protein != ""
AND ts > ?
AND length(id) > 1

UNION ALL

SELECT
id,
date,
'UROBILINOGEN' as TestID,
urobilinogen as stringResults,
null as result,
null as Units,
null as remark,
quantity,
method,
concat(uuid,'urobilinogen') as objectid, ts,
uuid as runId
FROM urine
where urobilinogen is not null and urobilinogen != ""
AND ts > ?
AND length(id) > 1

UNION ALL

SELECT
id,
date,
'NITRITE' as TestID,
nitrite as stringResults,
null as result,
null as Units,
null as remark,
quantity,
method,
concat(uuid,'nitrite') as objectid, ts,
uuid as runId
FROM urine
where nitrite is not null and nitrite != ""
AND ts > ?
AND length(id) > 1

UNION ALL

/* field misspelled in mysql */
SELECT
id,
date,
'LEUKOCYTES' as TestID,
leucocytes as stringResults,
null as result,
null as Units,
null as remark,
quantity,
method,
concat(uuid,'leukocytes') as objectid, ts,
uuid as runId
FROM urine
where leucocytes is not null and leucocytes != ""
AND ts > ?
AND length(id) > 1

UNION ALL

SELECT
id,
date,
'APPEARANCE' as TestID,
appearance as stringResults,
null as result,
null as Units,
null as remark,
quantity,
method,
concat(uuid,'appearance') as objectid, ts,
uuid as runId
FROM urine
where appearance is not null and appearance != ""
AND ts > ?
AND length(id) > 1

UNION ALL

SELECT
id,
date,
'MICROSCOPIC' as TestID,
microscopic as stringResults,
null as result,
null as Units,
null as remark,
quantity,
method,
concat(uuid,'microscopic') as objectid, ts,
uuid as runId
FROM urine
where microscopic is not null and microscopic != ""
AND ts > ?
AND length(id) > 1

UNION ALL

SELECT
id,
date,
'GLUC' as TestID,
glucose as stringResults,
null as result,
null as Units,
null as remark,
quantity,
method,
concat(uuid,'glucose') as objectid, ts,
uuid as runId
FROM urine
where glucose is not null and glucose != ""
AND ts > ?
AND length(id) > 1


) x


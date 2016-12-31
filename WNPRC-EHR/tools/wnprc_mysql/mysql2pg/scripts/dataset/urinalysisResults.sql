/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, FixDate(date) AS Date, ts, objectid

FROM

(

SELECT
id,
date,
'bilirubin' as TestID,
null as stringResults,
null as result,
null as Units,
null as remark,
concat(uuid,'bilirubin') as objectid, ts,
uuid as runId
FROM urine
where bilirubin is not null and bilirubin != ""


UNION ALL

SELECT
id,
date,
'ketone' as TestID,
null as stringResults,
null as result,
null as Units,
null as remark,
concat(uuid,'ketone') as objectid, ts,
uuid as runId
FROM urine
where ketone is not null and ketone != ""



UNION ALL

SELECT
id,
date,
'sp_gravity' as TestID,
null as stringResults,
sp_gravity as result,
null as Units,
null as remark,
concat(uuid,'sp_gravity') as objectid, ts,
uuid as runId
FROM urine
where sp_gravity is not null and sp_gravity != ""


UNION ALL

SELECT
id,
date,
'blood' as TestID,
null as stringResults,
null as result,
null as Units,
null as remark,
concat(uuid,'blood') as objectid, ts,
uuid as runId
FROM urine
where blood is not null and blood != ""


UNION ALL

SELECT
id,
date,
'PH' as TestID,
null as stringResults,
ph as result,
null as Units,
null as remark,
concat(uuid,'ph') as objectid, ts,
uuid as runId
FROM urine
where ph is not null and ph != ""


UNION ALL

SELECT
id,
date,
'protein' as TestID,
null as stringResults,
null as result,
null as Units,
null as remark,
concat(uuid,'protein') as objectid, ts,
uuid as runId
FROM urine
where protein is not null and protein != ""


UNION ALL

SELECT
id,
date,
'urobilinogen' as TestID,
null as stringResults,
null as result,
null as Units,
null as remark,
concat(uuid,'urobilinogen') as objectid, ts,
uuid as runId
FROM urine
where urobilinogen is not null and urobilinogen != ""


UNION ALL

SELECT
id,
date,
'nitrite' as TestID,
null as stringResults,
null as result,
null as Units,
null as remark,
concat(uuid,'nitrite') as objectid, ts,
uuid as runId
FROM urine
where nitrite is not null and nitrite != ""


UNION ALL

/* field misspelled in mysql */
SELECT
id,
date,
'leukocytes' as TestID,
null as stringResults,
null as result,
null as Units,
null as remark,
concat(uuid,'leukocytes') as objectid, ts,
uuid as runId
FROM urine
where leucocytes is not null and leucocytes != ""


UNION ALL

SELECT
id,
date,
'appearance' as TestID,
null as stringResults,
null as result,
null as Units,
null as remark,
concat(uuid,'appearance') as objectid, ts,
uuid as runId
FROM urine
where appearance is not null and appearance != ""


UNION ALL

SELECT
id,
date,
'microscopic' as TestID,
null as stringResults,
null as result,
null as Units,
null as remark,
concat(uuid,'microscopic') as objectid, ts,
uuid as runId
FROM urine
where microscopic is not null and microscopic != ""

UNION ALL

SELECT
id,
date,
'glucose' as TestID,
glucose as stringResults,
null as result,
null as Units,
null as remark,
concat(uuid,'glucose') as objectid, ts,
uuid as runId
FROM urine
where glucose is not null and glucose != ""

) x


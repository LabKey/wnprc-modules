/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
lower(id) as Id,
FixDate(date) AS Date,
ts,
objectid

FROM

(

SELECT
id,
date,
'LDH' as TestID,
ldh as Results,
null as stringResults,
null as Units,
null as remark,
concat(uuid,'ldh') as objectid, ts,
uuid as runId
FROM chemistry
where ldh is not null and ldh != ""

UNION ALL

SELECT
id,
date,
'GLUC' as TestID,
glucose as Results,
null as stringResults,
null as Units,
null as remark,
concat(uuid,'Glucose') as objectid, ts,
uuid as runId
FROM chemistry
where glucose is not null and glucose != ""


UNION ALL

SELECT
id,
date,
'BUN' as TestID,
bun as Results,
null as stringResults,
null as Units,
null as remark,
concat(uuid,'bun') as objectid, ts,
uuid as runId
FROM chemistry
where bun is not null and bun != ""


UNION ALL

SELECT
id,
date,
'CREAT' as TestID,
creatinine as Results,
null as stringResults,
null as Units,
null as remark,
concat(uuid,'creatinine') as objectid, ts,
uuid as runId
FROM chemistry
where creatinine is not null and creatinine != ""


UNION ALL

SELECT
id,
date,
'CPK' as TestID,
ck_cpk as Results,
null as stringResults,
null as Units,
null as remark,
concat(uuid,'ck_cpk') as objectid, ts,
uuid as runId
FROM chemistry
where ck_cpk is not null and ck_cpk != ""


UNION ALL

SELECT
id,
date,
'UA' as TestID,
uricacid as Results,
null as stringResults,
null as Units,
null as remark,
concat(uuid,'uricacid') as objectid, ts,
uuid as runId
FROM chemistry
where uricacid is not null and uricacid != ""


UNION ALL

SELECT
id,
date,
'CHOL' as TestID,
cholesterol as Results,
null as stringResults,
null as Units,
null as remark,
concat(uuid,'cholesterol') as objectid, ts,
uuid as runId
FROM chemistry
where cholesterol is not null and cholesterol != ""


UNION ALL

SELECT
id,
date,
'TRIG' as TestID,
triglyc as Results,
null as stringResults,
null as Units,
null as remark,
concat(uuid,'triglyc') as objectid, ts,
uuid as runId
FROM chemistry
where triglyc is not null and triglyc != ""


UNION ALL

SELECT
id,
date,
'SGOT' as TestID,
sgot_ast as Results,
null as stringResults,
null as Units,
null as remark,
concat(uuid,'sgot') as objectid, ts,
uuid as runId
FROM chemistry
where sgot_ast is not null and sgot_ast != ""


UNION ALL

SELECT
id,
date,
'TB' as TestID,
tbili as Results,
null as stringResults,
null as Units,
null as remark,
concat(uuid,'tbili') as objectid, ts,
uuid as runId
FROM chemistry
where tbili is not null and tbili != ""


UNION ALL

SELECT
id,
date,
'GGT' as TestID,
ggt as Results,
null as stringResults,
null as Units,
null as remark,
concat(uuid,'ggt') as objectid, ts,
uuid as runId
FROM chemistry
where ggt is not null and ggt != ""


UNION ALL

SELECT
id,
date,
'SGPT' as TestID,
sgpt_alt as Results,
null as stringResults,
null as Units,
null as remark,
concat(uuid,'sgpt_alt') as objectid, ts,
uuid as runId
FROM chemistry
where sgpt_alt is not null and sgpt_alt != ""


UNION ALL

SELECT
id,
date,
'TP' as TestID,
tprotein as Results,
null as stringResults,
null as Units,
null as remark,
concat(uuid,'tprotein') as objectid, ts,
uuid as runId
FROM chemistry
where tprotein is not null and tprotein != ""


UNION ALL

SELECT
id,
date,
'ALB' as TestID,
albumin as Results,
null as stringResults,
null as Units,
null as remark,
concat(uuid,'albumin') as objectid, ts,
uuid as runId
FROM chemistry
where albumin is not null and albumin != ""


UNION ALL

SELECT
id,
date,
'ALKP' as TestID,
phosphatase as Results,
null as stringResults,
null as Units,
null as remark,
concat(uuid,'phosphatase') as objectid, ts,
uuid as runId
FROM chemistry
where phosphatase is not null and phosphatase != ""


UNION ALL

SELECT
id,
date,
'CA' as TestID,
calcium as Results,
null as stringResults,
null as Units,
null as remark,
concat(uuid,'calcium') as objectid, ts,
uuid as runId
FROM chemistry
where calcium is not null and calcium != ""


UNION ALL

SELECT
id,
date,
'PHOS' as TestID,
phosphorus as Results,
null as stringResults,
null as Units,
null as remark,
concat(uuid,'phosphorus') as objectid, ts,
uuid as runId
FROM chemistry
where phosphorus is not null and phosphorus != ""


UNION ALL

SELECT
id,
date,
'FE' as TestID,
iron as Results,
null as stringResults,
null as Units,
null as remark,
concat(uuid,'iron') as objectid, ts,
uuid as runId
FROM chemistry
where iron is not null and iron != ""


UNION ALL

SELECT
id,
date,
'NA' as TestID,
sodium as Results,
null as stringResults,
null as Units,
null as remark,
concat(uuid,'sodium') as objectid, ts,
uuid as runId
FROM chemistry
where sodium is not null and sodium != ""


UNION ALL

SELECT
id,
date,
'K' as TestID,
potassium as Results,
null as stringResults,
null as Units,
null as remark,
concat(uuid,'potassium') as objectid, ts,
uuid as runId
FROM chemistry
where potassium is not null and potassium != ""


UNION ALL

SELECT
id,
date,
'CL' as TestID,
chloride as Results,
null as stringResults,
null as Units,
null as remark,
concat(uuid,'chloride') as objectid, ts,
uuid as runId
FROM chemistry
where chloride is not null and chloride != ""


UNION ALL

SELECT id, date, Upper(name) as TestID, null as Results, null as stringResults, NULL AS units, NULL as remark,
uuid as objectId, ts,
COALESCE((select UUID FROM chemistry t2 WHERE t1.id=t2.id and t1.date=t2.date limit 1), uuid) as runId
FROM chemisc t1


UNION ALL

SELECT id, date, upper(name) as TestID, value as results, null as stringResults, units AS units, NULL as remark,
uuid as objectId, ts,
COALESCE((select UUID FROM chemistry t2 WHERE t1.id=t2.id and t1.date=t2.date limit 1), uuid) as runId
FROM chemisc2 t1


) x

/* WHERE date != '0000-00-00' */
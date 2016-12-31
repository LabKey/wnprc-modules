/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
select
id, date, ts, uuid

FROM (

SELECT
lower(id) as Id,
FixDate(date) AS Date,
null as project,
lower(account) AS account,

null as collectedBy,
'Bacteriology' as type,
null as method,
null as sampleQuantity,

null as remark,
null as clinremark,
max(b.ts) as ts,
b.uuid AS objectid

FROM bacteriology b
WHERE length(id) > 1
GROUP BY b.id, b.date, b.account
/*HAVING max(ts) > ?*/

UNION ALL

SELECT
lower(p.id) as Id,
FixDate(p.date) as Date,
null as project,
lower(account) AS account,

null as collectedBy,
'Parasitology' as type,
null as method,
null as sampleQuantity,

FixNewlines(remark) AS remark,
FixNewlines(clinremark) AS clinremark,
p.ts as ts,
p.uuid AS objectid
FROM parahead p
WHERE length(id) > 1
/*AND ts > ?*/

UNION ALL

SELECT
lower(id) as Id,
FixDate(date) AS Date,
null as project,
null as account,

null as collectedBy,
'Immunology' as type,
null as method,
null as sampleQuantity,

null as remark,
null as clinremark,

ts,
uuid AS objectid
FROM immunores
WHERE length(id) > 1
/*AND ts > ?*/

UNION ALL

SELECT
lower(id) as Id,
FixDate(date) AS Date,
null as project,
lower(account) AS account,

null as collectedBy,
'Hematology' as type,
null as method,
null as sampleQuantity,


FixNewlines(remark) AS remark,
FixNewlines(clinremark) AS clinremark,

ts,
uuid AS objectid
FROM hematology
WHERE length(id) > 1
/*AND ts > ?*/

UNION ALL

SELECT
lower(id) as Id,
FixDate(date) AS Date,
null as project,
lower(account) AS account,

null as collectedBy,
'Chemistry' as type,
null as method,
null as sampleQuantity,

FixNewlines(remark) AS remark,
FixNewlines(clinremark) as clinremark,

ts,
uuid AS objectid
FROM chemistry
WHERE length(id) > 1
/*AND ts > ?*/

UNION ALL

SELECT
lower(id) as Id,
FixDate(date) AS Date,
null as project,
lower(account) as account,
collected_by as collectedBy,
'Urinalysis' as type,
method,
quantity as sampleQuantity,

FixNewlines(clincomment) as remark,
null as clinremark,

ts,
uuid AS objectid
FROM urine
WHERE length(id) > 1
/*AND ts > ?*/

UNION ALL

SELECT
lower(x.id) as Id,
FixDate(x.date) as Date,
null as project,
lower(x.account) as account,
null as collectedBy,
'Virology' as type,
null as method,
null as sampleQuantity,

x.remark,
x.clinremark,
x.ts,
x.uuid AS objectid

FROM (

SELECT id, date, account, remark, clinremark, max(ts) as ts, uuid, 'Serology' as method
  FROM virserohead
  WHERE id IS NOT NULL AND id != "" AND date != '0000-00-00'
  AND length(id) > 1
  group by id, date, account
  /*HAVING max(ts) > ?*/

UNION ALL

SELECT id, date, account, remark, clinremark, max(ts) as ts, uuid, 'Isolation' as method
  FROM virisohead
  WHERE id IS NOT NULL AND id != "" AND date != '0000-00-00'
  AND length(id) > 1
  group by id, date, account
  /*HAVING max(ts) > ?*/

) x


) s


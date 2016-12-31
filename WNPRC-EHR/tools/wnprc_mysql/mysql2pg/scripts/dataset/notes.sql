/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */



SELECT
d.Id,
d.birth as Date,
'Purchasing' as category,
d.purchasedby as value,
d.ts,
concat(d.uuid, 'p') as objectid
FROM abstract d
WHERE d.purchasedby != ''

UNION ALL

SELECT
d.id,
d.birth as date,
'Medical' as category,
d.medical as value,
d.ts,
concat(d.uuid, 'm') as objectid
FROM abstract d
WHERE d.medical != ''

UNION ALL

SELECT
d.id,
d.birth as date,
'Hold Codes' as category,
d.hold as value,
d.ts,
concat(d.uuid, 'h') as objectid
FROM abstract d
WHERE d.hold != ''

UNION ALL

SELECT
a.id,
a.adate as date,
'Vet Exemptions' as category,
p.title as value,
a.ts,
concat(a.uuid, 'v') as objectid
FROM assignment a
left join project p on (a.pno=p.pno)
where p.avail = 'v' and a.rdate IS NULL

UNION ALL

SELECT
a.id,
a.adate as date,
'Pending Assignments' as category,
p.title as value,
a.ts,
concat(a.uuid, 'p') as objectid
FROM assignment a
left join project p on (a.pno=p.pno)
where p.avail = 'p' and a.rdate IS NULL


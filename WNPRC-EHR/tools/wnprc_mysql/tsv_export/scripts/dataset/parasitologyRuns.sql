/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(p.id) as Id, FixDate(p.date) as Date, room, lower(account) AS account, FixNewlines(remark) AS remark, FixNewlines(clinremark) AS clinremark,
p.ts as ts, p.uuid AS objectid
FROM parahead p



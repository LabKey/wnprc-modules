/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
lower(x.id) as Id,
FixDate(x.date) as Date,
lower(x.account) as account,
x.remark,
x.clinremark,
x.ts,
x.uuid AS objectid

FROM (

SELECT id, date, account, remark, clinremark, max(ts) as ts, uuid
  FROM virserohead
  WHERE id IS NOT NULL AND id != "" AND date != '0000-00-00'
  group by id, date, account


UNION ALL

SELECT id, date, account, remark, clinremark, max(ts) as ts, uuid
  FROM virisohead
  WHERE id IS NOT NULL AND id != "" AND date != '0000-00-00'
  group by id, date, account


) x


/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, FixDate(date) AS Date, lower(account) AS account,
max(b.ts) as ts , b.uuid AS objectid

FROM bacteriology b

GROUP BY b.id, b.date, b.account



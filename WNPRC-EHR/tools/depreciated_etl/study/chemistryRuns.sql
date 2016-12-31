/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT lower(id) as Id, FixDate(date) AS Date, lower(account) AS account, FixNewlines(remark) AS remark, FixNewlines(clinremark) as clinremark,
uuid as runId,
ts, uuid AS objectid
FROM chemistry
WHERE ts > ? AND length(id) > 1


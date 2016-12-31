/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT lower(id) as Id, FixDate(date) AS Date, account, collected_by as userid, method, quantity, FixNewlines(clincomment) as remark,
uuid as runId,
uuid as parentId,
ts,
uuid AS objectid
FROM urine
WHERE ts > ?
AND length(id) > 1

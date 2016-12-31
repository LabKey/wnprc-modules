/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, FixDate(date) AS Date, morphology AS morphology, lower(account) AS account,
(select UUID FROM hematology t2 WHERE t1.id=t2.id and t1.date=t2.date limit 1) as runId,
uuid as objectid, ts
FROM hemamisc t1

WHERE ts > ?
AND length(id) > 1
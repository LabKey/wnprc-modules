/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
b.id,
b.date,
b.testId,
group_concat(b.result) as results

FROM (SELECT
b.id,
b.date,
b.testId,
coalesce(b.taskid, b.parentid, b.runId) as runId,
b.resultoorindicator,
CASE
WHEN b.result IS NULL THEN  b.qualresult
  ELSE CAST(TRUNCATE(ROUND(CAST(b.result AS NUMERIC), 2), 2) AS VARCHAR)
END as result

FROM study."Hematology Results" b

WHERE testId IN ('WBC', 'RBC', 'HGB', 'HCT', 'MCV', 'MCH','MCHC', 'RDW', 'PLT', 'MPV','PCV','NE','LY','MN','EO','BS','BANDS','METAMYELO','MYELO','TP','RETICULO', 'PRO MYELO', 'ATYL LYMPH', 'OTHER')
and b.qcstate.publicdata = true

UNION ALL

SELECT
b.id,
b.date,
b.testId,
coalesce(b.taskid, b.parentid) as runId,
b.percentoorindicator,
CAST(TRUNCATE(ROUND(CAST(b.result AS NUMERIC), 2), 2) AS VARCHAR),
FROM study.hematologyAbsCount b

) b

GROUP BY b.id, b.date, b.runId, b.testId
PIVOT results BY testId IN ('WBC', 'RBC', 'HGB', 'HCT', 'MCV', 'MCH','MCHC', 'RDW', 'PLT', 'MPV','PCV','NE','NE-ABS','LY','LY-ABS','MN','MN-ABS','EO','EO-ABS','BS','BS-ABS','BANDS','BANDS-ABS','METAMYELO','MYELO','TP','RETICULO', 'PRO MYELO', 'ATYL LYMPH', 'OTHER')


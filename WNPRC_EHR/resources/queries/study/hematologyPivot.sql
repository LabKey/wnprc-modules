/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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

WHERE testId IN ('WBC', 'RBC', 'HGB', 'HCT', 'MCV', 'MCH','MCHC', 'RDW', 'PLT', 'MPV','PCV','NE','LY','MN','EO','BS','BANDS','METAMYELO','MYELO','TP','RETICULO', 'PRO MYELO', 'ATYP', 'OTHER')
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
PIVOT results BY testId IN ('WBC', 'RBC', 'HGB', 'HCT', 'MCV', 'MCH','MCHC', 'RDW', 'PLT', 'MPV','PCV','NE','NE-ABS','LY','LY-ABS','MN','MN-ABS','EO','EO-ABS','BS','BS-ABS','BANDS','BANDS-ABS','METAMYELO','MYELO','TP','RETICULO', 'PRO MYELO', 'ATYP', 'OTHER')


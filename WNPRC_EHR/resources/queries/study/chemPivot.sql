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
b.Id,
b.date,
b.testId,
group_concat(b.result) as results

FROM (SELECT
b.Id,
b.date,
b.testId,
coalesce(b.taskid, b.parentid, b.runId) as runId,
b.resultoorindicator,
CASE
WHEN b.result IS NULL THEN  b.qualresult
  ELSE CAST(TRUNCATE(ROUND(CAST(b.result AS NUMERIC), 2), 2) AS VARCHAR)
END as result

FROM study."Chemistry Results" b
--WHERE testId IN ('GLUC', 'BUN', 'CREAT', 'CPK', 'CHOL', 'TRIG','SGOT', 'LDH', 'LDL', 'TB','GGT','SGPT','TP','ALB','ALKP','CA','PHOS','FE','NA','K','CL', 'UA')
WHERE testId IN ('GLUC', 'BUN', 'CREAT', 'NA', 'K', 'CL','iCa', 'CA','PHOS', 'TCO2', 'AnGap', 'pH', 'PCO2', 'HCO3', 'PO2', 'sO2' , 'HGB', 'HCT',	'SGOT', 'SGPT',	'TB', 'GGT',	'ALKP',	'ALB',	'TP',	'FE',	'CPK',	'CHOL',	'TRIG',	'LDH',	'LDL',	'BE',	'LACT',	'CEACT'	,'CTPNI')
and b.qcstate.publicdata = true

) b

GROUP BY b.id, b.date, b.runId, b.testId
-- PIVOT results BY testId IN ('GLUC', 'BUN', 'CREAT', 'CPK', 'CHOL', 'TRIG','SGOT', 'LDH', 'LDL', 'TB','GGT','SGPT','TP','ALB','ALKP','CA','PHOS','FE','NA','K','CL', 'UA')
PIVOT results BY testId IN ('GLUC', 'BUN', 'CREAT', 'NA', 'K', 'CL', 'iCa','CA','PHOS', 'TCO2', 'AnGap', 'pH', 'PCO2', 'HCO3', 'PO2', 'sO2' , 'HGB', 'HCT',	'SGOT', 'SGPT',	'TB', 'GGT',	'ALKP',	'ALB',	'TP',	'FE',	'CPK',	'CHOL',	'TRIG',	'LDH',	'LDL',	'BE',	'LACT',	'CEACT'	,'CTPNI')




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



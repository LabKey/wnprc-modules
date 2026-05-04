
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
  ELSE CAST(CAST(ROUND(CAST(b.result AS NUMERIC), 4) AS DOUBLE) AS VARCHAR)
END as result
FROM study."Hematology Results" b

WHERE testId IN ('WBC', 'RBC', 'HGB', 'HCT', 'MCV', 'MCH','MCHC', 'RDW','RDW-SD', 'RDW-CV', 'PLT', 'MPV','PCV','NE','LY','MN','EO','BS','BANDS','METAMYELO','MYELO','TP','RETICULO', 'RETIC-AB', 'IRF', 'NRBC', 'NRBC#', 'RETIC HGB', 'IPF', 'PDW', 'P-LCR', 'PCT', 'LFR', 'MFR', 'HFR', 'PRO MYELO', 'ATYP', 'OTHER')
and b.qcstate.publicdata = true

UNION ALL

SELECT
b.id,
b.date,
b.testId,
coalesce(b.taskid, b.parentid) as runId,
b.percentoorindicator,
CAST(CAST(ROUND(CAST(b.result AS NUMERIC), 2) AS DOUBLE) AS VARCHAR)
FROM study.hematologyAbsCount b

) b

GROUP BY b.id, b.date, b.runId, b.testId
PIVOT results BY testId IN ('WBC', 'RBC', 'HGB', 'HCT', 'MCV', 'MCH','MCHC', 'RDW','RDW-SD', 'RDW-CV', 'PLT', 'MPV','PCV','NE','NE-ABS','LY','LY-ABS','MN','MN-ABS','EO','EO-ABS','BS','BS-ABS','BANDS','BANDS-ABS','METAMYELO','MYELO','TP','RETICULO', 'RETIC-AB', 'IRF', 'NRBC', 'NRBC#', 'RETIC HGB', 'IPF', 'PDW', 'P-LCR', 'PCT', 'LFR', 'MFR', 'HFR', 'PRO MYELO', 'ATYP', 'OTHER')


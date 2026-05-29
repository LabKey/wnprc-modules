/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  b.id,
  b.date,
  b.testId,
  --b.runId,
  b.resultOORIndicator,
  b.result,
  b.qualresult,
  b.remark,
  b.qcstate,
  b.taskid
FROM study."Chemistry Results" b

WHERE
b.testId NOT IN ('LDL', 'GLUC', 'BUN', 'CREAT', 'CPK', 'UA', 'CHOL', 'TRIG','SGOT', 'LDH', 'TB','GGT','SGPT','TP','ALB','ALKP','CA','PHOS','FE','NA','K','CL')
or b.testid is null


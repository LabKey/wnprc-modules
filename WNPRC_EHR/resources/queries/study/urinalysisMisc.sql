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
  b.qcstate,
  b.remark,
  b.method,
  b.taskid
FROM study."Urinalysis Results" b

WHERE
b.testId NOT IN ('APPEARANCE', 'COLOR','GLUC', 'BILIRUBIN', 'KETONE', 'SP_GRAVITY', 'BLOOD', 'PH', 'PROTEIN','UROBILINOGEN', 'NITRITE', 'LEUKOCYTES')
or b.testid is null


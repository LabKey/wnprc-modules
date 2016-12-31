/*
 * Copyright (c) 2011-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  b.id,
  b.date,
  b.testId || '-ABS' as testId,
  b.resultOORIndicator as percentOORIndicator,
  b.result as percent,
  b2.result as wbc,
  b2.resultOORIndicator as wbcOORIndicator,
  cast(round(b2.result * (b.result/100), 2) as float) as result,
  --b.qualresult,
  b.qcstate,
  b.taskid,
  b.parentid
FROM study."Hematology Results" b

LEFT JOIN study."Hematology Results" b2
ON (
  b.id = b2.id and b.date = b2.date and b2.testId = 'WBC'
  and (b.taskid = b2.taskid OR b.taskid is null)
)

WHERE
b.testId IN ('NE', 'LY', 'MN', 'EO', 'BS', 'BANDS', 'METAMYELO', 'MYELO', 'TP', 'RETICULO', 'PRO MYELO', 'ATYP', 'OTHER')
and b.qcstate.publicdata = true
and b2.qcstate.publicdata = true
and b2.id is not null
and b.result is not null
and b2.result is not null

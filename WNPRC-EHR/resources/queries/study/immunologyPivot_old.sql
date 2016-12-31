/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

h.id,
h.date,
max(h.CD3) as CD3,
max(h.CD20) as CD20,
max(h.CD4) as CD4,
max(h.CD8) as CD8

FROM (

SELECT

h.id,
h.date,
h.runId,

CASE WHEN h.testid='CD3'
  THEN h.result
  ELSE null
END as CD3,

CASE WHEN h.testid='CD4'
  THEN h.result
  ELSE null
END as CD4,

CASE WHEN h.testid='CD8'
  THEN h.result
  ELSE null
END as CD8,

CASE WHEN h.testid='CD20'
  THEN h.result
  ELSE null
END as CD20

FROM study."Immunology Results" h
WHERE h.qcstate.publicdata = true

) h

GROUP BY h.id, h.date, h.runId
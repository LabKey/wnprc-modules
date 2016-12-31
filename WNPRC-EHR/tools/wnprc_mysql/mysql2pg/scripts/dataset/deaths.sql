/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
lower(id) as Id,
FixDate(death) AS date,
status,
CASE
  WHEN status = 'd-othr' THEN 'Other'
  WHEN status = 'd-expr' THEN 'Experimental'
  WHEN status = 'd-qx' THEN 'QX'
  WHEN status = 'd-qc' THEN 'QC'
  WHEN status = 'd-quar' THEN 'Quarantine'
END as cause,
ts,
uuid AS objectid

FROM abstract
WHERE death is not null
/*and  ts > ?*/
AND length(id) > 1
having cause is null
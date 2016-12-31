/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query displays all animals co-assigned to the same protocol.
--to be considered co-assigned, they only need to overlap by some period of time 

SELECT
  a1.lsid,
  a1.Id,
  a1.project,
  a1.date,
  a1.enddate,
  a2.Id AS CoAssigned,
  a2.date AS CoAssignStart,
  a2.enddate AS CoAssignStop,
  TIMESTAMPDIFF('SQL_TSI_DAY', a2.date, a2.enddate) + round(TIMESTAMPDIFF('SQL_TSI_HOUR', a2.date, a2.enddate)/24, 1) as DaysCoAssigned

FROM study.Assignment a1

LEFT JOIN study.Assignment a2
    ON (
      (
      (a2.Date >= a1.date AND a2.Date < COALESCE(a1.enddate, now()))
      OR
      (COALESCE(a2.enddate, now()) > a1.date AND COALESCE(a2.enddate, now()) <= COALESCE(a1.enddate, now()))

      )
      AND a1.Id != a2.Id AND a1.project = a2.project
      AND a1.qcstate.publicdata = true
      AND a2.qcstate.publicdata = true
    )

WHERE a1.project.protocol != 'wprc00'
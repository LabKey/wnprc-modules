/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  p.project,
  cast(coalesce(count(a.lsid), 0) as integer) as activeAssignments

FROM ehr.project p
LEFT JOIN study.assignment a ON (p.project = a.project AND a.isActive = true)
GROUP BY p.project
/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  p2.id,
  p2.parentid,
  p2.taskid,
  GROUP_CONCAT(DISTINCT p2.userrole, '') as participants
FROM (
SELECT
  p.role || ': ' || p.username || chr(10) as userrole,
  p.id,
  p.parentid,
  p.taskid
FROM ehr.encounter_participants p
) p2

GROUP BY p2.id, p2.parentid, p2.taskid
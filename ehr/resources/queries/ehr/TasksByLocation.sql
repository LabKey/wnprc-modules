/*
 * Copyright (c) 2011-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  --sd.id.curlocation.room as room,

  sd.id.curLocation.room as room,

  group_concat(DISTINCT sd.id) as Ids,

--   t.title,
--   t.formtype,
  t.taskId,
  t.formtype
--   t.assignedTo,
--   t.duedate,
--   t.created,
--   t.createdby,
--   t.qcstate

FROM ehr.tasks t

JOIN study.studydata sd

ON (t.taskid = sd.taskid)

GROUP BY
t.taskid,
t.formtype,
sd.id.curLocation.room


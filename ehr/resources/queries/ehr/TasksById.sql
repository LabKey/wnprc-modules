/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  sd.id,
--   sd.id.curlocation.location as location,
--   sd.id.curlocation.room,
--   sd.id.curlocation.cage,
--   t.title,
--   t.formtype,
  t.taskId,
  t.formtype,
--   t.assignedTo,
--   t.duedate,
--   t.created,
--   t.createdby,
--   t.qcstate

FROM ehr.tasks t

JOIN study.studydata sd

ON (t.taskid = sd.taskid)

GROUP BY t.taskId, t.formtype, sd.id


/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
a.Id,

group_concat(a.project) as projects,
group_concat(DISTINCT a.project.avail) as availability,
group_concat(DISTINCT a.project.title) as titles,
group_concat (DISTINCT a.project.inves)as investigators,

CASE
  WHEN group_concat(DISTINCT a.project.avail) LIKE '%r%' THEN 'Assigned'
  WHEN group_concat(DISTINCT a.project.avail) LIKE '%n%' THEN 'Assigned'
  WHEN group_concat(DISTINCT a.project.avail) LIKE '%b%' THEN 'Assigned'
  WHEN group_concat(a.project) like '%20050602%' THEN 'Pending'
  WHEN group_concat(DISTINCT a.project.avail) LIKE '%p%' THEN 'Pending'

   ELSE 'Unassigned'
END as AssignmentStatus,


FROM study.assignment a
WHERE a.qcstate.publicdata = true and cast(a.date as date) <= curdate() AND (a.enddate is null or a.enddate > now())
GROUP BY a.id
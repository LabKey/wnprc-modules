/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
d.species, d.viralstatus, d.assignmentstatus, count(*) as total

FROM (

SELECT
a.Id,
coalesce(a.id.viralstatus.viralstatus, 'Unknown') as viralstatus,
-- a.id.viralstatus.viralstatus || a.id.dataset.demographics.species as keyField,
a.id.dataset.demographics.species as species,

CASE
  WHEN (
    group_concat(DISTINCT a.project.avail) LIKE '%b%' AND
    (group_concat(DISTINCT a.project.avail) LIKE '%r%' or group_concat(DISTINCT a.project.avail) LIKE '%n%')
    ) THEN 'Breeding and Research'
  WHEN (
    group_concat(DISTINCT a.project.avail) LIKE '%r%' or
    group_concat(DISTINCT a.project.avail) LIKE '%n%'
    ) THEN 'Research'
  WHEN group_concat(DISTINCT a.project.avail) LIKE '%b%' THEN 'Breeding'
  --this project is pre-assignment physicals
  WHEN group_concat(a.project) like '%20050602%' THEN 'Pending'
  WHEN group_concat(DISTINCT a.project.avail) LIKE '%p%' THEN 'Pending'

   ELSE 'None of These'
END as AssignmentStatus

FROM study.assignment a
WHERE
a.qcstate.publicdata = true
and cast(a.date as date) <= curdate()
AND (a.enddate is null or a.enddate > now())
and a.id.dataset.demographics.calculated_status = 'Alive'
AND a.id.dataset.demographics.species != 'Unknown'

GROUP BY a.id, a.id.viralstatus.viralstatus, a.id.dataset.demographics.species, (a.id.viralstatus.viralstatus || a.id.dataset.demographics.species)

) d

GROUP BY d.viralstatus, d.species, d.assignmentstatus

PIVOT total by assignmentstatus

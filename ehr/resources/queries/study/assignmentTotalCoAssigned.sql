/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query is designed to be joined into Assignment using lsid
SELECT
  a1.lsid,

  --the total number of assignments overlapping with this record
  --COUNT(a2.Id) as OverlappingAssignments,

  --the total number of assignments on this animal overlapping with this record
  COUNT(a1.CoAssigned) as ConcurrentAssignments,
  group_concat(DISTINCT a1.coassigned, ', ') as CoAssignedAnimals

FROM study.assignmentCoAssignedAnimals a1

WHERE a1.enddate IS NULL

GROUP BY a1.lsid


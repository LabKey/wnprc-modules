/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  p.protocol,
  count(distinct a.Id) AS TotalActiveAnimals,
  group_concat(distinct a.Id) AS ActiveAnimals,

FROM ehr.protocol p

--we find total distinct animals ever assigned to this protocol
LEFT JOIN
  (SELECT a.Project.protocol as protocol, a.id, count(*) AS TotalAssignments, max(a.date) as LatestStart,
  max(a.enddateCoalesced) as latestEnd
  FROM study.assignment a
  WHERE a.isActive = true
  GROUP BY a.project.protocol, a.id) a ON (p.protocol = a.protocol)

group by p.protocol
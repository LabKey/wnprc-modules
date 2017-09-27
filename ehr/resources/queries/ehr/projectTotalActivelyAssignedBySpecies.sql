/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  a.project,
  a.id.demographics.species as species,
  count(*) AS activeAssignments

FROM study.Assignment a
WHERE a.isActive = true
GROUP BY a.project, a.id.demographics.species
PIVOT activeAssignments by species IN (select distinct a.id.demographics.species from study.assignment a)

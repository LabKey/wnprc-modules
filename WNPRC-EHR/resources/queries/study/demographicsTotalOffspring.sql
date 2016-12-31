/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.id,
group_concat(DISTINCT d2.id) as Offspring,
count(DISTINCT d2.id)  AS TotalOffspring,
SUM(CASE WHEN d2.calculated_status = 'Alive' THEN 1 ELSE 0 END) as TotalLivingOffspring,

min(d2.birth) as earliestBirth,
max(d2.birth) as latestBirth

FROM study.Demographics d

JOIN study.Demographics d2
  ON (d.Id = d2.sire OR d.Id = d2.dam)

GROUP BY d.id


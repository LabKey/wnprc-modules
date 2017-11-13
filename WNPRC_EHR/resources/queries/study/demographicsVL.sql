/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  v.Id,
  max(v.ViralLoad) as MaxViralLoad,
  min(v.ViralLoad) as MinViralLoad,
  min(v.date) as FirstViralLoadDate,
  max(v.date) as LastViralLoadDate,
  (select avg(v1.viralLoad) as viralLoad FROM study.ViralLoads v1 WHERE v1.Id=v.Id AND max(v.date)=v1.date) as LatestViralLoad

FROM study.ViralLoads v


group by v.Id
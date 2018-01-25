/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT v.id, v.date, v.ViralLoad as LatestViralLoad
FROM study.ViralLoads v JOIN
   (SELECT id, MAX(date) as maxDate FROM study.ViralLoads GROUP BY id) m ON
   v.id = m.id AND v.date = m.maxDate



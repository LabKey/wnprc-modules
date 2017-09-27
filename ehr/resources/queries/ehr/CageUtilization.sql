/*
 * Copyright (c) 2010-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  c.location,
  c.room,
  c.cage,
  count(DISTINCT h.id) as TotalAnimals,
  group_concat(DISTINCT h.id, chr(10)) as animals

FROM ehr_lookups.cages c

LEFT JOIN study.housing h

ON (c.room=h.room AND c.cage=h.cage)

WHERE h.isActive = true

GROUP BY c.location, c.room, c.cage


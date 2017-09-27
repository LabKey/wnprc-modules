/*
 * Copyright (c) 2010-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

--find all cages used by active housing records, which do not have a corresponding record in ehr_lookups.cage
SELECT
h.room,
h.cage

FROM study.housing h

LEFT JOIN ehr_lookups.cage c
  on (c.room=h.room and c.cage=h.cage)

WHERE c.cage is null and h.isActive = true and h.cage is not null

group by h.room, h.cage
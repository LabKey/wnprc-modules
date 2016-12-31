/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
d.room

FROM study.housing d

LEFT JOIN ehr_lookups.rooms c
  on (c.room=d.room)

WHERE c.room is null and d.enddate is null

group by d.room
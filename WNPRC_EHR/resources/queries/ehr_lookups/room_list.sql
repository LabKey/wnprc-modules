/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  DISTINCT c.room as room,

  c.room.area as area
  
FROM ehr_lookups.cages c
where c.room != '' and c.room is not null
group by c.room, c.room.area

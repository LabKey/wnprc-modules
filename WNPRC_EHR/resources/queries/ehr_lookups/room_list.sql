/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  DISTINCT c.room as room,

  c.room.area as area
  
FROM ehr_lookups.cages c
where c.room != '' and c.room is not null
group by c.room, c.room.area

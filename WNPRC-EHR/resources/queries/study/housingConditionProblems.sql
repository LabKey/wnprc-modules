/*
 * Copyright (c) 2011-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
select
h.id,
h.room,
h.cage,
h.cond,
h.id.numRoommates.numRoommates as numRoommates,
CASE
  WHEN (h.cond = 's' or h.cond = 'pc') AND h.id.numRoommates.numRoommates != 0 THEN 'ERROR'
  WHEN (h.cond = 'p' or h.cond = 'm' or h.cond = 'f') AND h.id.numRoommates.numRoommates != 1 THEN 'ERROR'
  WHEN (h.cond = 'g' or h.cond = 'gam' or h.cond = 'gf' or h.cond = 'gm' or h.cond = 'gmf') AND h.id.numRoommates.numRoommates < 2 THEN 'ERROR'
  ELSE null
END as conditionStatus

from study.housing h

where h.enddate is null


/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  concat(room, "-", cage) AS roomcage, room, cage, length, width, height, ts, uuid AS objectid
from cage
WHERE ts > ?


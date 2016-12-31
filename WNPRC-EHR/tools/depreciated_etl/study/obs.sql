/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id,
FixDateTime(date, time) AS Date,
(userid) AS userid,
(userid) AS performedby,
(feces) AS feces,
menses, (behavior) AS behavior, (breeding) AS breeding, (other) AS other,
tlocation, FixNewlines(remark) AS remark, (otherbehavior) AS otherbehavior,
ts, uuid AS objectid
FROM obs
WHERE ts > ?
AND length(id) > 1
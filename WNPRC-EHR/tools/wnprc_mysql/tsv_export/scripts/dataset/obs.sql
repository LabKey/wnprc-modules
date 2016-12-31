/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, FixDateTime(date, time) AS Date, (userid) AS userid, (feces) AS feces, (menses) AS menses, (behavior) AS behavior, (breeding) AS breeding, (other) AS other, (tlocation) AS tlocation, substr(FixNewlines(remark), 1, 100) AS remark, (otherbehavior) AS otherbehavior,
ts, uuid AS objectid
FROM obs


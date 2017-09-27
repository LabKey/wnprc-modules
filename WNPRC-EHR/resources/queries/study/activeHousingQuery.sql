/*
 * Copyright (c) 2011-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
h.Id,
max(h.date) as date,
max(h.enddate) as enddate,
group_concat(DISTINCT h.room) as room,
group_concat(DISTINCT h.cage) as cage,
group_concat(DISTINCT h.cond) as cond,
group_concat(DISTINCT h.remark) as remark,
group_concat(DISTINCT h.reason) as reason,
group_concat(DISTINCT h.performedby) as performedby,
FROM Housing h
WHERE h.enddate is null and h.qcstate.publicdata = true
group by h.id
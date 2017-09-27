/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d2.id,

(d2.room || '-' || d2.cage) AS Location,

d2.room.area,

d2.room,

d2.cage

FROM study.housing d2
JOIN (SELECT id, max(date) as maxDate FROM study.housing h GROUP BY id) h
ON (h.id = d2.id and d2.date = h.maxdate)
WHERE d2.qcstate.publicdata = true
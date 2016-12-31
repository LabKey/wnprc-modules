/*
 * Copyright (c) 2011-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

PARAMETERS(StartDate TIMESTAMP, EndDate TIMESTAMP, Room CHAR DEFAULT NULL, Cage CHAR DEFAULT NULL)

SELECT
h.Id,
cast(StartDate as timestamp) as date

FROM study.housing h

WHERE

(h.room = ROOM OR ROOM IS NULL or ROOM = '') AND
(h.cage = CAGE OR CAGE IS NULL OR CAGE = '') AND

/* entered startdate must be <= enddate */
coalesce( STARTDATE , cast('1900-01-01 00:00:00.0' as timestamp)) <= coalesce(ENDDATE, now())
and

/* entered startdate must be less than record's enddate */
coalesce( STARTDATE , cast('1900-01-01 00:00:00.0' as timestamp)) < coalesce(h.enddate, now())
and

/* entered enddate must be greater than record's startdate */
coalesce(ENDDATE, now()) >= coalesce(h.date, now())

GROUP BY h.Id
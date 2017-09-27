/*
 * Copyright (c) 2011-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

PARAMETERS(StartDate TIMESTAMP, EndDate TIMESTAMP, Room CHAR DEFAULT NULL, Cage CHAR DEFAULT NULL)

SELECT
h.Id,
cast(StartDate as timestamp) as date,

FROM study.housing h

WHERE

(h.room = ROOM OR ROOM IS NULL or ROOM = '') AND
(h.cage = CAGE OR CAGE IS NULL OR CAGE = '') AND

/* entered startdate must be <= enddate */
cast(coalesce(STARTDATE , cast('1900-01-01' as DATE)) as DATE) <= cast(coalesce(ENDDATE, now()) as DATE)
and

/* entered startdate must be less than record's enddate */
cast(coalesce(STARTDATE , cast('1900-01-01' as DATE)) as DATE) < cast(coalesce(h.enddate, now()) as DATE)
and

/* entered enddate must be greater than record's startdate */
cast(coalesce(ENDDATE, now()) as DATE) >= cast(coalesce(h.date, now()) as DATE)

GROUP BY h.Id
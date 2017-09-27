/*
 * Copyright (c) 2011-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/**
  * This query is designed to find housing records that overlap.  In this query, the overlap to calculated based on both date and time
  * A record that ends at the same time that a second record begins is not considered an overlap.
  */
PARAMETERS(StartDate TIMESTAMP, EndDate TIMESTAMP, Room CHAR DEFAULT NULL, Cage CHAR DEFAULT NULL)

SELECT
h.lsid,
h.id,
h.room,
h.cage,
h.date,
h.enddate,
h.reason,
h.remark,
h.qcstate

FROM study.housing h

WHERE

(h.room = ROOM OR ROOM IS NULL or ROOM = '') AND
(h.cage = CAGE OR CAGE IS NULL OR CAGE = '') AND

/* entered startdate must be <= entered enddate */
coalesce( STARTDATE , cast('1900-01-01 00:00:00.0' as timestamp)) <= coalesce(ENDDATE, now())
and

/* entered startdate must be less than record's enddate */
coalesce( STARTDATE , cast('1900-01-01 00:00:00.0' as timestamp)) < coalesce(h.enddate, now())
and

/* entered enddate must be greater than record's startdate */
coalesce(ENDDATE, now()) >= coalesce(h.date, now())
/*
 * Copyright (c) 2011-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/**
  * This query is designed to find housing records that overlap.  In this query, the overlap to calculated based on date only
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

(
  (cast(COALESCE(STARTDATE, '1900-01-01') AS DATE) >= cast(h.date AS DATE) AND cast(COALESCE(STARTDATE, '1900-01-01') AS DATE) < cast(COALESCE(h.enddate, now()) AS DATE))
  OR
  (cast(COALESCE(ENDDATE, now()) AS DATE) > cast(h.date AS DATE) AND cast(COALESCE(ENDDATE, now()) AS DATE) <= cast(COALESCE(h.enddate, now()) AS DATE))
  OR
  (cast(COALESCE(STARTDATE, '1900-01-01') AS DATE) <= cast(h.date AS DATE) AND cast(COALESCE(ENDDATE, now()) AS DATE) >= cast(COALESCE(h.enddate, now()) AS DATE))
)
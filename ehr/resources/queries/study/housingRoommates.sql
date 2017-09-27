/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query displays all animals co-housed with each housing record
--to be considered co-housed, they only need to overlap by any period of time
SELECT
t.lsid,
t.id,
t.date as StartDate,
t.enddate as RemovalDate,
t.room,
t.cage,
t.RoommateId,
t.RoommateStart,
t.RoommateEnd,
t.reason,
TIMESTAMPDIFF('SQL_TSI_DAY', t.RoommateStart, COALESCE(t.RoommateEnd, now())) as DaysCoHoused,
t.duration,
t.qcstate

FROM (

SELECT

h1.lsid,
h1.id,
h1.date,
h1.enddate,
h1.room,
h1.cage,
h2.id as RoommateId,
CASE
  WHEN h2.date > h1.date THEN h2.date
  else h1.date
END AS RoommateStart,
CASE
  WHEN h2.enddateTimeCoalesced < h1.enddateTimeCoalesced THEN h2.enddate
  else h1.enddate
END AS RoommateEnd,
h1.duration,
IFDEFINED(h1.reason) as reason,
h1.qcstate
FROM study.Housing h1

LEFT JOIN study.Housing h2
    ON (
      ((h2.Date < h1.enddateTimeCoalesced AND h2.enddateTimeCoalesced > h1.date) OR (h1.Date < h2.enddateTimeCoalesced AND h1.enddateTimeCoalesced > h2.date))
      AND
      h1.id != h2.id AND h1.room = h2.room AND (h1.cage = h2.cage OR (h1.cage is null and h2.cage is null))
      AND h2.qcstate.publicdata = true
    )

WHERE h1.qcstate.publicdata = true

) t
/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

lower(h2.id) as id,
FixDateTime(h1.date, h1.time) AS Date,
h2.room as RoomAtTime,
h2.cage as CageAtTime,
h1.uuid as observationRecord,
h2.uuid as housingRecord,
h1.ts,
concat(h1.uuid, h2.uuid) as objectid

FROM cagenotes h1

LEFT JOIN housing h2
    ON (
      (
      FixDateTime(h2.idate, h2.itime) <= FixDateTime(h1.date, h1.time) AND
      coalesce(FixDateTime(h2.odate, h2.otime), now()) > FixDateTime(h1.date, h1.time)
      ) AND
      h1.room = h2.room AND h1.cage = h2.cage
      )


WHERE
length(h2.id) > 1
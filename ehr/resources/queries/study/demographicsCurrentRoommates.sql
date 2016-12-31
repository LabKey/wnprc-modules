/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  d.id,
  count(DISTINCT h.RoommateId) as NumRoommates,
  (count(DISTINCT h.RoommateId)+1) as AnimalsInCage,
  group_concat(DISTINCT h.RoommateId) as cagemates

FROM study.demographics d
LEFT JOIN (
  SELECT
  h1.id,
  h2.id as RoommateId
  FROM study.Housing h1
  LEFT OUTER JOIN study.Housing h2 ON (
    h1.enddate IS NULL AND -- only look at current housing assignments (no end date)
    h2.enddate IS NULL AND -- only look at current housing assignments (no end date)
    h1.id != h2.id AND -- don't include self as roommate
    h1.room = h2.room AND -- Make sure room matches
    (h1.cage = h2.cage OR (h1.cage is null and h2.cage is null)) -- make sure cage matches
  )
  WHERE h1.qcstate.publicdata = true AND h2.qcstate.publicdata = true
) h
  ON (h.id = d.id)

WHERE d.calculated_status='Alive'

GROUP BY d.id

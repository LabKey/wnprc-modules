/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query displays all animals co-housed with each housing record
--to be considered co-housed, they only need to overlap by any period of time

SELECT

  h1.id,
  group_concat(DISTINCT h1.cond) as condition,
  count(DISTINCT h2.Id) AS NumRoommates,
  group_concat(DISTINCT h2.Id) as Roommates

FROM study.Housing h1

LEFT OUTER JOIN study.Housing h2
    ON (
      (
      (h2.Date >= h1.date AND h2.Date < COALESCE(h1.enddate, now()))
      OR
      (COALESCE(h2.enddate, now()) > h1.date AND COALESCE(h2.enddate, now()) <= COALESCE(h1.enddate, now()))

      ) AND
      h1.id != h2.id AND h1.room = h2.room AND h1.cage = h2.cage
      )


WHERE h1.qcstate.publicdata = true
AND h2.qcstate.publicdata = true
AND age_in_months(h1.id.dataset.demographics.birth, COALESCE(h1.id.dataset.demographics.death, now())) >= 6

GROUP BY h1.id


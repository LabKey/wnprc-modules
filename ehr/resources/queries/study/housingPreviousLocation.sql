/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
t1.lsid,
h3.room,
h3.cage,
CASE
  WHEN h3.cage IS NULL then h3.room
  ELSE (h3.room || ' / ' || h3.cage)
END as location

FROM (
  SELECT
  h1.lsid,
  h1.id,
  max(h2.date) as prevDate
  FROM study.housing h1
  JOIN study.housing h2 ON (h2.id = h1.id AND h2.date < h1.date)
  GROUP BY h1.lsid , h1.id
) t1
JOIN study.housing h3 ON (t1.id = h3.id AND t1.prevDate = h3.date)

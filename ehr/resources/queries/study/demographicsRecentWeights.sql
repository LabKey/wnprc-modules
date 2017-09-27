/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.id,

(SELECT
  group_concat(w.weight) As weights
  FROM study.weight w
  WHERE w.id=d.id
  --ORDER BY w.date desc
  --LIMIT 3
  ) AS weights

FROM study.demographics d
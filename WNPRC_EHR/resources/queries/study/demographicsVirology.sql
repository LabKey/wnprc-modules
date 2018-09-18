/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

  SELECT
    v.id,
    count(*) as numPosResults,
    group_concat(DISTINCT v.virus) as PositivePathogens

  FROM study.virologyResults v
  WHERE
  (v.result like '%pos%' OR v.result like '%+%') AND
  v.qcstate.publicdata = true
  GROUP BY v.id



/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  p2.id,
  p2.parentid,
  GROUP_CONCAT(DISTINCT p2.flag, chr(10)) as flags
FROM (
SELECT
  p.flag || ': ' || p.value as flag,
  p.id,
  p.parentid
FROM ehr.encounter_flags p
) p2

GROUP BY p2.id, p2.parentid
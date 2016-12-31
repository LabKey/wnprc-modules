/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  p2.id,
  p2.recordid,
  GROUP_CONCAT(DISTINCT p2.code, '') as codes
FROM (
SELECT
  p.id,
  p.code.meaning || ' (' || p.code || ')' || chr(10) as code,
  p.recordid
FROM ehr.snomed_tags p
) p2

GROUP BY p2.id, p2.recordid
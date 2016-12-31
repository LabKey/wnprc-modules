/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  p.id,
  p.parentid,
  group_concat(p.remark, chr(10)) as summary
FROM ehr.encounter_summaries p
WHERE (p.category IS NULL OR p.category = 'Narrative')
GROUP BY p.id, p.parentid
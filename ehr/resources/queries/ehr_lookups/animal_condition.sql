/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  v.code,
  v.value as meaning,
  v.datedisabled
FROM ehr_lookups.flag_values v
WHERE v.category = 'Condition'
/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  k.Id,
  k.Id2,
  k.coefficient

FROM ehr.kinship k

UNION ALL

SELECT
  k.Id2 as Id,
  k.Id as Id2,
  k.coefficient

FROM ehr.kinship k
WHERE k.Id != k.Id2
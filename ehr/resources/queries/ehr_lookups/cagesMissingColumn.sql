/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  c.cage
FROM ehr_lookups.cage c
LEFT JOIN ehr_lookups.cage_positions cp ON (c.cage = cp.cage)
WHERE cp.cage IS NULL and cp.cage IS NOT NULL;
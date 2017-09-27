/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  DISTINCT units as units

FROM ehr_lookups.lab_tests
WHERE units IS NOT NULL and units != ''
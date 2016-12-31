/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  u.DisplayName,
  'u' as type,
  u.FirstName,
  u.LastName

FROM core.users u
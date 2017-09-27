/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  t.formType,
  cast(t.created as date) as created,
  count(*) as total

FROM ehr.tasks t

GROUP BY t.formType, cast(t.created as date)
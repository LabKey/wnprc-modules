/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query provides an overview of the MHC SSP results
SELECT
  s.Id,
  s.shortName,
  max(s.Status) as result,

FROM study.MHC_SSP_Summary s

GROUP BY s.Id, s.shortName
PIVOT result BY shortName
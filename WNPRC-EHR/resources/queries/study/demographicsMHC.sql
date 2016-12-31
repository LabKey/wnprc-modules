/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT * FROM (
  SELECT MAX(A01) AS A01, MAX(A02) AS A02, MAX(A11) AS A11, MAX(B08) AS B08, MAX(B17) AS B17, COUNT(*) AS totalAllelesTyped, Id
  FROM
  (
    SELECT
    CASE WHEN ShortName = 'A01' THEN Status ELSE NULL END AS A01,
    CASE WHEN ShortName = 'A02' THEN Status ELSE NULL END AS A02,
    CASE WHEN ShortName = 'A11' THEN Status ELSE NULL END AS A11,
    CASE WHEN ShortName = 'B08' THEN Status ELSE NULL END AS B08,
    CASE WHEN ShortName = 'B17' THEN Status ELSE NULL END AS B17,
    Id
    FROM study.MHC_SSP_Summary
  )
  X GROUP BY Id
) Y
WHERE totalAllelesTyped > 0
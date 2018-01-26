/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

--this query provides an overview of allele frequencies for WNPRC animals
SELECT
 s.allele,

  count(*) AS TotalPositive,

  max(s1.total) AS TotalTyped,
  
  100 * count(*) / max(s1.total) AS Frequency

FROM study.MHC_SSP_Summary s

LEFT JOIN
  --find total distinct animals from each allele
  (SELECT s1.Allele, count(*) AS total FROM study.MHC_SSP_Summary s1 GROUP BY s1.Allele) s1
  ON (s.Allele = s1.Allele)

WHERE s.Allele IS NOT NULL AND s.Status = 'POS'

GROUP BY s.Allele


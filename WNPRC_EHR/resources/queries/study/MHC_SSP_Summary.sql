/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query provides an overview of the MHC SSP results
SELECT
  m.SubjectId as Id,
  m.Institution AS Institution,
  m.PrimerPair.ref_nt_name AS Allele,
  group_concat(DISTINCT m.PrimerPair) AS PrimerPairs,
  group_concat(DISTINCT m.PrimerPair.ShortName) AS ShortName,

  count(*) as TotalRecords,

  CASE
    WHEN (max(m.Result)=min(m.result))
      THEN max(m.Result)
    ELSE 'DISCREPANCY'
  END
  AS Status

FROM "/WNPRC/WNPRC_Units/Research_Services/MHC_SSP/Private/MHC_DB/".assay."MHC_SSP Data" m

WHERE (m.Institution='Wisconsin NPRC' or m.Institution='Harlow')
AND m.result != 'FAIL' and m.result != 'IND'

GROUP BY m.SubjectId, m.PrimerPair.ref_nt_name, m.Institution




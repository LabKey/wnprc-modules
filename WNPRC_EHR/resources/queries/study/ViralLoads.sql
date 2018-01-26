/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  v.rowid,
  v.SubjectId as Id,
  v.Date as date,
  v.assayId.virus AS Virus,

  CASE
    WHEN (v.ViralLoad < 50)
      THEN 50
    else
      v.ViralLoad
    END
   as ViralLoad,

  round(
  CASE
    WHEN (v.ViralLoad < 50)
      THEN log10(50)
    else
      log10(v.ViralLoad)
    END, 1)
   as LogVL

FROM "/WNPRC/WNPRC_Units/Research_Services/Virology_Services/VL_DB/".assay."Viral_Load Data" v

--TODO
--WHERE v.qcstate.publicdata = true


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
  v.comment as Comments,

  CASE
    WHEN (v.ViralLoad < 100)
      THEN 100
    else
      v.ViralLoad
    END
   as ViralLoad,
   v.sourcematerial.type as SampleType,
   v.run.exptNumber AS VL_ExpNumber,
   QC.Expt_nr AS QC_ExptNumber,
   QC.QC_Pass AS QC_Pass


FROM "/WNPRC/WNPRC_Units/Research_Services/Virology_Services/VL_DB/".assay."Viral_Load Data" v

LEFT JOIN "/WNPRC/WNPRC_Units/Research_Services/Virology_Services/VS_group_wiki/".lists."QPCR_QC_list" QC
ON CAST (v.run.exptNumber AS FLOAT) = QC.Expt_nr
--WHERE QC.QC_Pass = 'FALSE'



--TODO
--WHERE v.qcstate.publicdata = true


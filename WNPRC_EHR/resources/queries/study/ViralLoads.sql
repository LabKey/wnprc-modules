/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  pv.rowid,
  pv.Id as Id,
  pv.date as date,
  pv.Virus AS Virus,
  pv.Comments as Comments,

   AVG(pv.ViralLoad) AS AverViralLoad,
   log10(AVG(pv.ViralLoad)) as LogVL

FROM study.preViralLoad pv

GROUP BY pv.date,pv.Id, pv.Virus, pv.Comments

--TODO
--WHERE v.qcstate.publicdata = true


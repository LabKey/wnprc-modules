/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  v.rowid,
  v.Id,
  v.Virus,
  v.Date,
  vc.date as ChallengeDate,
  vc.code,
  v.ViralLoad,
  v.LogVL,
  TIMESTAMPDIFF('SQL_TSI_DAY', vc.date, v.Date) as DPI,
  TIMESTAMPDIFF('SQL_TSI_DAY', vc.date, v.Date)/7 as WPI

FROM study.ViralLoads v

LEFT JOIN ViralChallenges vc
  ON (v.id = vc.id)

WHERE vc.challenge_type like 'SIV%' AND vc.challenge_Type NOT LIKE '%Vaccine%'

AND vc.date is not null


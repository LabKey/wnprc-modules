/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

select

  v.rowid,

  max(v.Id) as Id,
--   max(v.Virus) as Virus,
  max(v.Date) as date,
--   max(v.ChallengeDate) as ChallengeDate,
  max(v.code) as code,
  max(v.ViralLoad) as ViralLoad,
  max(v.LogVL) as LogVL,
  group_concat(WPI) as WPI,
  group_concat(DPI) as DPI,


FROM (

SELECT
  v.rowid,
  v.Id,
  v.Virus,
  v.Date,
--   vc.date as ChallengeDate,
--   vc.challenge_type as ChallengeType,
  vc.code,
  v.ViralLoad,
  v.LogVL,
  chr(10) || cast(vc.date as date) || ' (' || vc.challenge_type || '): ' || TIMESTAMPDIFF('SQL_TSI_DAY', vc.date, v.Date) as DPI,
  chr(10) || cast(vc.date as date) || ' (' || vc.challenge_type || '): ' || cast(round(TIMESTAMPDIFF('SQL_TSI_DAY', vc.date, v.Date)/7, 1) as numeric) as WPI,

  vc.challenge_Type

FROM study.ViralLoads v

LEFT JOIN study.ViralChallenges vc
  ON (v.id = vc.id)

WHERE vc.challenge_type like 'SIV%' --AND vc.challenge_Type NOT LIKE '%Vaccine%'

AND vc.date is not null

) v

group by v.rowid
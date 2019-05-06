/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

select

  v.rowid,

  max(v.Id) as Id,
  max(v.ChallengeType) AS ChallengeType,
   max(v.Virus) as Virus,
  max(v.Date) as date,
   max(v.ChallengeDate) as ChallengeDate,
  max(v.code) as code,
  max(v.AverageViralLoad) as AverageViralLoad,
  max(v.LogVL) as LogVL,
  group_concat(SampleType) AS SampleType,
  group_concat(Comments) AS Comments,
  group_concat(WPI) as WPI,
  group_concat(DPI) as DPI,


FROM (

SELECT
  v.rowid,
  v.Id,
  v.Virus,
  v.Date,
  vc.date as ChallengeDate,
  vc.challenge_type AS ChallengeType,
  vc.code,
  v.AverageViralLoad,
  v.LogVL,
  v.SampleType,
  v.Comments,
  chr(10) || cast(vc.date as date) || ' (' || vc.challenge_type || '): ' || TIMESTAMPDIFF('SQL_TSI_DAY', vc.date, v.Date) as DPI,
  chr(10) || cast(vc.date as date) || ' (' || vc.challenge_type || '): ' || cast(round(TIMESTAMPDIFF('SQL_TSI_DAY', vc.date, v.Date)/7, 1) as numeric) as WPI,

  vc.challenge_Type

FROM study.ViralLoads v

LEFT JOIN study.ViralChallenges vc
  ON (v.id = vc.id)


WHERE ((vc.challenge_type like 'SIV%' OR vc.challenge_type like '%virus') AND vc.challenge_type NOT LIKE '%Vaccine%'
        --match the name of the challenge wiht the name of the virus, SIV has a difference name
        AND ((upper(vc.challenge_type) LIKE upper(v.virus)) OR (locate(upper(vc.challenge_type),upper(v.virus)) >= 0)
        )

AND vc.date is not null)

) v
GROUP BY  v.rowid--, v.ChallengeType


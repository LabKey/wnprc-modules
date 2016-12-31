/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.Id,

max(d.date) as Date,

min(d.WeeksSinceChallenge) as WeeksSinceChallenge,

d.Challenge_Type

FROM study.ViralChallenges d

WHERE d.challenge_type like 'SIV%' AND d.challenge_Type NOT LIKE '%Vaccine%'

GROUP BY d.Id, d.challenge_Type
/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.Id AS Id,

d.date,
d.project,
round(
CASE
  WHEN (d.id.dataset.demographics.death IS NULL)
    THEN (timestampdiff('SQL_TSI_DAY', d.date, curdate())/7)
   ELSE
    --(timestampdiff('SQL_TSI_DAY', d.date, id.dataset.demographics.death)/7)
    null
END
, 1) as WeeksSinceChallenge,

d.code,
v.code.meaning as meaning,

d.remark,

v.secondaryCategory AS challenge_type

FROM study.drug d

JOIN ehr_lookups.snomed_subset_codes v ON v.code = d.code

WHERE
v.primaryCategory = 'Viral Challenges' AND
d.qcstate.publicdata = true
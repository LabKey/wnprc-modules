/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query displays all animals co-housed with each housing record
--to be considered co-housed, they only need to overlap by any period of time

SELECT

h1.id,

CASE
  --never had a roommate
  WHEN count(h2.id) = 0
    then min(h1.date)
  --has an active roommate
  WHEN (max(coalesce(h2.enddate, now())) = now()) OR (max(h2.date) >= max(coalesce(h2.enddate, now())))
    THEN null
  ELSE
    max(h2.enddate)
END as AloneSince,

convert(
CASE
  --never had a roommate
  WHEN count(h2.id) = 0
    then TIMESTAMPDIFF('SQL_TSI_DAY', min(h1.date), now())
  --has an active roommate
  WHEN (max(coalesce(h2.enddate, now())) = now()) OR (max(h2.date) >= max(coalesce(h2.enddate, now())))
    THEN 0
  ELSE
    TIMESTAMPDIFF('SQL_TSI_DAY', max(h2.enddate), now())
END, 'INTEGER') as DaysAlone,

group_concat(distinct a.project) as Exemptions,
group_concat(distinct a.project.title) as ExemptionTitles

FROM study.Housing h1

--find any overlapping housing record
LEFT OUTER JOIN study.Housing h2
    ON (
      (
      (h2.Date >= h1.date AND h2.Date < COALESCE(h1.enddate, now()))
      OR
      (COALESCE(h2.enddate, now()) > h1.date AND COALESCE(h2.enddate, now()) <= COALESCE(h1.enddate, now()))

      ) AND
      h1.id != h2.id AND h1.room = h2.room AND h1.cage = h2.cage
      )

--join to vet exemptions
LEFT JOIN study.assignment a
  --ON (h1.id = a.id AND a.EndDate IS NULL and a.project.title LIKE '%pairing exempt%')
  ON (h1.id = a.id AND a.EndDate IS NULL and a.project IN (19980301,19970301,20001001,20031101,20060202))

WHERE
--h1.id.Status.Status = 'Alive'
h1.id.dataset.demographics.calculated_status = 'Alive'
--AND a.qcstate.publicdata = true
AND h1.qcstate.publicdata = true
AND h2.qcstate.publicdata = true

--filter out pairing exempt animals
--AND a.id IS NULL

GROUP BY
h1.id

-- HAVING
-- max(a.value) IS NULL

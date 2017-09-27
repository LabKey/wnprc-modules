/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d1.id,

CASE
  WHEN (COALESCE(d1.sire, '') = COALESCE(d2.sire, '') and COALESCE(d1.dam, '') = COALESCE(d2.dam, '') AND COALESCE(d1.sire, '')!='' AND COALESCE(d1.dam, '')!='')
    THEN 'Full Sib'
  WHEN (COALESCE(d1.sire, '') = COALESCE(d2.sire, '') AND COALESCE(d1.sire, '') != '' AND (COALESCE(d1.dam, '') != COALESCE(d2.dam, '') OR COALESCE(d1.dam, '') = ''))
    THEN 'Half-Sib Paternal'
  WHEN (COALESCE(d1.dam, '') = COALESCE(d2.dam, '') AND COALESCE(d1.dam, '') != '' AND (COALESCE(d1.sire, '') != COALESCE(d2.sire, '') OR COALESCE(d1.sire, '') = ''))
    THEN 'Half-Sib Maternal'
  WHEN (COALESCE(d1.sire, '') != COALESCE(d2.sire, '') and COALESCE(d1.dam, '') != COALESCE(d2.dam, ''))
    THEN 'ERROR'
  END AS Relationship,

d2.id  AS Sibling,

--t.d1,
--COALESCE(d1.sire, ''),
d2.dam AS SiblingDam,
d2.sire AS SiblingSire,
d1.qcstate
-- FROM (
--
-- SELECT d1.id, d2.id as sib, d2.dam as dam2, d2.sire as sire2,
-- --coalesce used to simplify CASE comparison above
-- COALESCE(d1.dam, '') as d1, COALESCE(d2.dam, '') as d2, COALESCE(d1.sire, '') as s1, COALESCE(d2.sire, '') as s2

FROM study.Demographics d1

--removed left join
JOIN study.Demographics d2
  ON ((d2.sire = d1.sire OR d2.dam = d1.dam) AND d1.id != d2.id)

WHERE d2.id is not null

-- ) t


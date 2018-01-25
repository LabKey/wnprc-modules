/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  d.Id AS Id,

   CASE
    WHEN(d.Id like 'r%')THEN('Rhesus')
    WHEN(d.Id like 'cy%')THEN('Cynomolgus')
    WHEN(d.Id like 'cj%')THEN('Marmoset')
    WHEN(d.Id like 'm%')THEN('Marmoset')
    WHEN(d.Id like 'tx%')THEN('Marmoset')
    WHEN(d.Id like 'ag%')THEN('Vervet')
    WHEN(d.Id like 'so%')THEN('Cotton-top Tamarin')
    WHEN(d.Id like 'st%')THEN('Stump Tailed')
    ELSE 'Unknown'
  END AS species,

FROM study.Demographics d

-- LEFT JOIN ehr_lookups.species s ON (d.id ~* s.prefix)
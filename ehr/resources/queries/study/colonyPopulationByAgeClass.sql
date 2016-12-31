/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  d.species,
  d.gender,
  d.id.ageclass.label AS ageClass,
  count(d.Id) AS animalCount

FROM study.Demographics d

WHERE
d.calculated_status = 'Alive' AND d.species != 'Unknown'

GROUP BY d.species, d.gender, d.id.ageclass.label




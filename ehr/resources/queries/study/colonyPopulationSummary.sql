/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
(
SELECT

d.id.dataset.demographics.species,
count(d.Id) AS AnimalCount

FROM study.Demographics d

WHERE
d.calculated_status = 'Alive'
AND d.id.dataset.demographics.species != 'Unknown'

GROUP BY d.id.dataset.demographics.species
)
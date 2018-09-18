/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.id,
d.gender,
'Offspring' as Relationship,

d2.id  AS Offspring,

d.qcstate

FROM study.Demographics d

INNER JOIN study.Demographics d2
  ON ((d2.sire = d.id OR d2.dam = d.id) AND d.id != d2.id)


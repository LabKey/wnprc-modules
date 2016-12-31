/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d1.id,

d1.dam,

d1.sire,

dam.dam AS MaternalGranddam,

dam.sire AS MaternalGrandsire,

sire.dam AS PaternalGranddam,

sire.sire AS PaternalGrandsire,

d1.qcstate

FROM study.Demographics d1

LEFT JOIN study.Demographics dam
  ON (d1.dam = dam.id)

LEFT JOIN study.Demographics sire
  ON (d1.sire = sire.id)

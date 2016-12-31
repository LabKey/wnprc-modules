/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, FixDate(date) as Date, FixSpecies(species) as species, sex as gender, weight, lower(dam) as dam, lower(sire) as sire, room, cage, FixDate(conception) as conception, remark,
ts, uuid AS objectid

FROM prenatal p
WHERE ts > ?
AND length(id) > 1
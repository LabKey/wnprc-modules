/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT testname, unit, juv_m, juv_f, adult_m, adult_f, ger_m, ger_f, FixSpecies(species) AS species, ts, uuid AS objectid
FROM chemnorm  
WHERE ts > ?
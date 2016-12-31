/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.species DROP COLUMN blood_vol_multiplier;
ALTER TABLE ehr_lookups.species ADD blood_per_kg double precision;
ALTER TABLE ehr_lookups.species ADD max_draw_pct double precision;
ALTER TABLE ehr_lookups.species ADD blood_draw_interval double precision;
GO

UPDATE ehr_lookups.species set blood_per_kg = 60;
UPDATE ehr_lookups.species set max_draw_pct = 0.2;
UPDATE ehr_lookups.species set blood_draw_interval = 30;

UPDATE ehr_lookups.species set max_draw_pct = 0.15 WHERE common = 'Marmoset';

DROP TABLE ehr_lookups.account_tiers;
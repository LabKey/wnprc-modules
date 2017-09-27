/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.procedure_default_treatments rename column concentration_units to conc_units;

ALTER TABLE ehr_lookups.procedure_default_treatments rename column volume_units to vol_units;

UPDATE ehr_lookups.procedure_default_treatments set amount = dosage;
UPDATE ehr_lookups.procedure_default_treatments set dosage = null;

UPDATE ehr_lookups.procedure_default_treatments set amount_units = dosage_units;
UPDATE ehr_lookups.procedure_default_treatments set dosage_units = null;
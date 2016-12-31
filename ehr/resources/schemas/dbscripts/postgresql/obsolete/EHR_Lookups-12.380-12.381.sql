/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.drug_defaults ADD route varchar(100);
ALTER TABLE ehr_lookups.drug_defaults ADD frequency int;
ALTER TABLE ehr_lookups.drug_defaults ADD volume double precision;
ALTER TABLE ehr_lookups.drug_defaults ADD vol_units varchar(100);
ALTER TABLE ehr_lookups.drug_defaults ADD amount double precision;
ALTER TABLE ehr_lookups.drug_defaults ADD amount_units varchar(100);

ALTER TABLE ehr_lookups.drug_defaults ADD duration double precision;
ALTER TABLE ehr_lookups.drug_defaults ADD "offset" double precision;
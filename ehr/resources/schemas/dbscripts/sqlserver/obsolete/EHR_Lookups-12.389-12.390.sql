/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.drug_defaults ADD category varchar(100);
ALTER TABLE ehr_lookups.drug_defaults ADD volume_rounding double precision;
ALTER TABLE ehr_lookups.drug_defaults ADD amount_rounding double precision;
ALTER TABLE ehr_lookups.drug_defaults ADD amount_max double precision;
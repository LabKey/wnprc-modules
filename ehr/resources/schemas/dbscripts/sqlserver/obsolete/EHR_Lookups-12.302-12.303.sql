/*
 * Copyright (c) 2012-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE TABLE ehr_lookups.billingTypes (
  rowid int identity(1,1),
  name varchar(100),

  CONSTRAINT PK_billingTypes PRIMARY KEY (rowid)
);

INSERT INTO ehr_lookups.billingTypes (name) VALUES ('Surgery');
INSERT INTO ehr_lookups.billingTypes (name) VALUES ('Clinical');
INSERT INTO ehr_lookups.billingTypes (name) VALUES ('Non-Center Staff');

ALTER TABLE ehr_lookups.species ADD blood_vol_multiplier double precision;
GO
UPDATE ehr_lookups.species set blood_vol_multiplier = 0.1;
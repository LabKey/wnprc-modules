/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE TABLE ehr_lookups.flag_categories (
  category varchar(100),
  description varchar(4000),
  enforceUnique bit,

  CONSTRAINT pk_flag_categories PRIMARY KEY (category)
);

GO

INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('ABG', 0);
INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('Alert', 0);
INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('ATG', 0);
INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('BSU', 0);
INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('Candidate', 0);
INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('Condition', 1);
INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('Flag', 0);
INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('PTG', 0);
INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('SPF', 1);
INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('TB', 0);
INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('TMB', 0);

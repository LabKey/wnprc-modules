/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE TABLE ehr_lookups.flag_categories (
  category varchar(100),
  description varchar(4000),
  enforceUnique boolean,

  CONSTRAINT pk_flag_categories PRIMARY KEY (category)
);

INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('ABG', false);
INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('Alert', false);
INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('ATG', false);
INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('BSU', false);
INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('Candidate', false);
INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('Condition', true);
INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('Flag', false);
INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('PTG', false);
INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('SPF', true);
INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('TB', false);
INSERT INTO ehr_lookups.flag_categories (category, enforceUnique) VALUES ('TMB', false);

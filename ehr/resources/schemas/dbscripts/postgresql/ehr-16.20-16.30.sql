/*
 * Copyright (c) 2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/* ehr-16.20-16.21.sql */

CREATE TABLE ehr.institutions (
  id int not null,
  name varchar(50),
  abbreviation varchar(10),
  city varchar(40),
  state varchar(2),
  country varchar(20),
  affiliate varchar(100),
  web_site varchar(200),
  fileStatus varchar(2),
  recordClass varchar(4),
  objectid varchar(100),
  Created TIMESTAMP,
  CreatedBy USERID,
  Modified TIMESTAMP,
  ModifiedBy USERID,
  Container	entityId NOT NULL,

  CONSTRAINT PK_EHR_INSTITUTIONS PRIMARY KEY (id),
  CONSTRAINT FK_EHR_INSTITUTIONS FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

/* ehr-16.21-16.22.sql */

CREATE INDEX EHR_INSTITUTIONS_CONTAINER_INDEX ON ehr.institutions(Container);
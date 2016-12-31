/*
 * Copyright (c) 2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/* ehr-16.20-16.21.sql */

CREATE TABLE ehr.institutions (
  id int not null,
  name NVARCHAR(50),
  abbreviation NVARCHAR(10),
  city NVARCHAR(40),
  state NVARCHAR(2),
  country NVARCHAR(20),
  affiliate varchar(50),
  web_site varchar(200),
  fileStatus NVARCHAR(2),
  recordClass NVARCHAR(4),
  objectid nvarchar(100),
  Created DATETIME,
  CreatedBy USERID,
  Modified DATETIME,
  ModifiedBy USERID,
  Container	entityId NOT NULL,

  CONSTRAINT PK_EHR_INSTITUTIONS PRIMARY KEY (id),
  CONSTRAINT FK_EHR_INSTITUTIONS FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);
GO

/* ehr-16.21-16.22.sql */

CREATE INDEX EHR_INSTITUTIONS_CONTAINER_INDEX ON ehr.institutions(Container);
GO
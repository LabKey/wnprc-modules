/*
 * Copyright (c) 2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
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
DROP TABLE IF EXISTS wnprc.surgery_procedure_rooms;
CREATE TABLE wnprc.surgery_procedure_rooms(
  room VARCHAR(50),
  type VARCHAR(50),
  email VARCHAR(50),
  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT pk_surgery_procedure_rooms PRIMARY KEY (room)
);

DROP TABLE IF EXISTS wnprc.surgery_procedure_type;
CREATE TABLE wnprc.surgery_procedure_type(
  type VARCHAR(50),
  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT pk_surgery_procedure_type PRIMARY KEY (type)
);
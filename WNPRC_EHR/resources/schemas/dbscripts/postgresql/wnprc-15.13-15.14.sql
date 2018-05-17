DROP TABLE IF EXISTS wnprc.surgery_type;
CREATE TABLE wnprc.surgery_type(
  type VARCHAR(50),
  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT pk_surgery_type PRIMARY KEY (type)
);

DROP TABLE IF EXISTS wnprc.surgery_procedure;
CREATE TABLE wnprc.surgery_procedure(
  procedure VARCHAR(50),
  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT pk_surgery_procedure PRIMARY KEY (procedure)
);
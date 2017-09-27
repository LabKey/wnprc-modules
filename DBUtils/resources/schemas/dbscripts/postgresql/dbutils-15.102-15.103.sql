DROP TABLE IF EXISTS dbutils.private_files;
CREATE TABLE dbutils.private_files (
  uuid TEXT,

  filename TEXT NOT NULL,
  extension TEXT NOT NULL,

  -- Default fields for LabKey.
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_private_files PRIMARY KEY (uuid)
);
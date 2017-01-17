-- Create schema, tables, indexes, and constraints used for GoogleDrive module here
-- All SQL VIEW definitions should be created in googledrive-create.sql and dropped in googledrive-drop.sql
CREATE SCHEMA googledrive;

CREATE TABLE googledrive.service_accounts (
  id           TEXT NOT NULL,
  display_name TEXT,

  project_id     TEXT NOT NULL,
  private_key_id TEXT NOT NULL,
  private_key    TEXT NOT NULL,
  client_email   TEXT NOT NULL,
  client_id      TEXT NOT NULL,
  auth_uri       TEXT NOT NULL,
  token_uri      TEXT NOT NULL,
  client_x509_cert_url        TEXT NOT NULL,
  auth_provider_x509_cert_url TEXT NOT NULL,

  -- Default fields for LabKey.
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_service_accounts PRIMARY KEY (id)
);
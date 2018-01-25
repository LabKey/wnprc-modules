ALTER TABLE wnprc_compliance.persons DROP COLUMN IF EXISTS archived_for_access_purposes;
ALTER TABLE wnprc_compliance.persons ADD COLUMN archived_for_access_purposes BOOLEAN DEFAULT FALSE;
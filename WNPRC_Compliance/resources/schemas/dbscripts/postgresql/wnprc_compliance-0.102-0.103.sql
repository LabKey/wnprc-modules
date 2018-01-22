ALTER TABLE wnprc_compliance.persons DROP COLUMN IF EXISTS date_of_birth;
ALTER TABLE wnprc_compliance.persons ADD COLUMN date_of_birth TIMESTAMP;
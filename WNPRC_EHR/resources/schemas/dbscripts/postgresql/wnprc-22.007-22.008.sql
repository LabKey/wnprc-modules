-- A conditionalized version of wnprc-22.001-21.002.sql that got added in 22.11
DO $$
BEGIN
IF NOT EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='animal_requests' and column_name='principalinvestigatorold')
THEN
    ALTER TABLE IF EXISTS wnprc.animal_requests RENAME COLUMN principalinvestigator TO principalinvestigatorold;
END IF;

IF NOT EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='animal_requests' and column_name='principalinvestigator')
THEN
    ALTER TABLE IF EXISTS wnprc.animal_requests ADD COLUMN principalinvestigator INTEGER;
END IF;

IF NOT EXISTS(SELECT *
    FROM information_schema.constraint_column_usage
    WHERE table_name='investigators' and lower(constraint_name) = 'fk_wnprc_animal_requests_ehr_investigators_rowid')
THEN
    ALTER TABLE IF EXISTS wnprc.animal_requests ADD CONSTRAINT FK_WNPRC_ANIMAL_REQUESTS_EHR_INVESTIGATORS_ROWID FOREIGN KEY (principalinvestigator) REFERENCES ehr.investigators (rowid);
END IF;
END
$$ LANGUAGE plpgsql;

-- A conditionalized version of wnprc-21.006-21.007.sql that was added as a new script 'wnprc-22.001-21.002.sql' in develop (and was backported to 21.11)
alter table if exists wnprc.animal_requests add column if not exists pregnantanimalsrequiredterminfant varchar(100);
alter table if exists wnprc.animal_requests add column if not exists pregnantanimalsrequiredtermdam varchar(100);
alter table if exists wnprc.animal_requests add column if not exists majorsurgery varchar(100);
alter table if exists wnprc.animal_requests add column if not exists previousexposures text;
alter table if exists  wnprc.animal_requests add column if not exists contacts text;
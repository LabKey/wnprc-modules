/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE FUNCTION ehr.handleUpgrade() RETURNS VOID AS $$
DECLARE
    BEGIN
      IF NOT EXISTS (
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='lookup_sets' and table_schema='ehr_lookups' and column_name='rowid'
      )
      THEN
        -- Run variants of scripts from the trunk

        ALTER TABLE ehr_lookups.lookup_sets ADD rowid serial;
        ALTER TABLE ehr_lookups.lookup_sets ADD container entityid;
        ALTER TABLE ehr_lookups.lookups ADD container entityid;

        ALTER TABLE ehr_lookups.lookup_sets ADD CONSTRAINT PK_lookup_sets PRIMARY KEY (rowid);

        --upgrade path for WNPRC
        UPDATE ehr_lookups.lookup_sets SET container = (SELECT c.entityid from core.containers c LEFT JOIN core.Containers c2 on (c.Parent = c2.EntityId) WHERE c.name = 'EHR' and c2.name = 'WNPRC');
        UPDATE ehr_lookups.lookups SET container = (SELECT c.entityid from core.containers c LEFT JOIN core.Containers c2 on (c.Parent = c2.EntityId) WHERE c.name = 'EHR' and c2.name = 'WNPRC');

        --this will upgrade ONPRC, since the query above will leave all records NULL
        UPDATE ehr_lookups.lookup_sets SET container = (SELECT c.entityid from core.containers c LEFT JOIN core.Containers c2 on (c.Parent = c2.EntityId) WHERE c.name = 'EHR' and c2.name = 'ONPRC') WHERE container IS NULL;
        UPDATE ehr_lookups.lookups SET container = (SELECT c.entityid from core.containers c LEFT JOIN core.Containers c2 on (c.Parent = c2.EntityId) WHERE c.name = 'EHR' and c2.name = 'ONPRC') WHERE container IS NULL;

        --this will delete any other pre-existing records lacking a container.  the result should be to give WNPRC an upgrade, but truncate any team city agents
        DELETE FROM ehr_lookups.lookup_sets WHERE container IS NULL;
        DELETE FROM ehr_lookups.lookups WHERE container IS NULL;
      END IF;
    END;
$$ LANGUAGE plpgsql;

SELECT ehr.handleUpgrade();

DROP FUNCTION ehr.handleUpgrade();

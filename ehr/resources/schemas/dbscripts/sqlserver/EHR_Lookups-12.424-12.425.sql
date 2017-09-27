/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EXEC core.fn_dropifexists 'handleUpgrade', 'ehr', 'PROCEDURE';
GO

CREATE PROCEDURE ehr.handleUpgrade AS
    BEGIN
    IF NOT EXISTS(SELECT column_name
            FROM information_schema.columns
            WHERE table_name='lookup_sets' and table_schema='ehr_lookups' and column_name='rowid')
        BEGIN
        -- Run variants of scripts from trunk

        ALTER TABLE ehr_lookups.lookup_sets ADD rowid int identity(1,1);
        ALTER TABLE ehr_lookups.lookup_sets ADD container entityid;
        ALTER TABLE ehr_lookups.lookups ADD container entityid;

        ALTER TABLE ehr_lookups.lookup_sets ADD CONSTRAINT PK_lookup_sets PRIMARY KEY (rowid);
        END
    END;

GO

EXEC ehr.handleUpgrade
GO

DROP PROCEDURE ehr.handleUpgrade
GO

--upgrade path for WNPRC
UPDATE ehr_lookups.lookup_sets SET container = (SELECT c.entityid from core.containers c LEFT JOIN core.Containers c2 on (c.Parent = c2.EntityId) WHERE c.name = 'EHR' and c2.name = 'WNPRC') WHERE container IS NULL;;
UPDATE ehr_lookups.lookups SET container = (SELECT c.entityid from core.containers c LEFT JOIN core.Containers c2 on (c.Parent = c2.EntityId) WHERE c.name = 'EHR' and c2.name = 'WNPRC') WHERE container IS NULL;;

--this will upgrade ONPRC, since the query above will leave all records NULL
UPDATE ehr_lookups.lookup_sets SET container = (SELECT c.entityid from core.containers c LEFT JOIN core.Containers c2 on (c.Parent = c2.EntityId) WHERE c.name = 'EHR' and c2.name = 'ONPRC') WHERE container IS NULL;
UPDATE ehr_lookups.lookups SET container = (SELECT c.entityid from core.containers c LEFT JOIN core.Containers c2 on (c.Parent = c2.EntityId) WHERE c.name = 'EHR' and c2.name = 'ONPRC') WHERE container IS NULL;

--this will delete any other pre-existing records lacking a container.  the result should be to give WNPRC an upgrade, but truncate any team city agents
DELETE FROM ehr_lookups.lookup_sets WHERE container IS NULL;
DELETE FROM ehr_lookups.lookups WHERE container IS NULL;

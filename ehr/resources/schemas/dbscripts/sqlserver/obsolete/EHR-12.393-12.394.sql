/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr.project ADD container entityid;
ALTER TABLE ehr.protocol ADD container entityid;
GO
--upgrade path for WNPRC
UPDATE ehr.project SET container = (SELECT c.entityid from core.containers c LEFT JOIN core.Containers c2 on (c.Parent = c2.EntityId) WHERE c.name = 'EHR' and c2.name = 'WNPRC');
UPDATE ehr.protocol SET container = (SELECT c.entityid from core.containers c LEFT JOIN core.Containers c2 on (c.Parent = c2.EntityId) WHERE c.name = 'EHR' and c2.name = 'WNPRC');

--this will upgrade ONPRC, since the query above will leave all records NULL
UPDATE ehr.project SET container = (SELECT c.entityid from core.containers c LEFT JOIN core.Containers c2 on (c.Parent = c2.EntityId) WHERE c.name = 'EHR' and c2.name = 'ONPRC') WHERE container IS NULL;
UPDATE ehr.protocol SET container = (SELECT c.entityid from core.containers c LEFT JOIN core.Containers c2 on (c.Parent = c2.EntityId) WHERE c.name = 'EHR' and c2.name = 'ONPRC') WHERE container IS NULL;

--this will delete any other pre-existing records lacking a container.  the result should be to give WNPRC an upgrade, but truncate any team city agents
DELETE FROM ehr.project WHERE container IS NULL;
DELETE FROM ehr.protocol WHERE container IS NULL;
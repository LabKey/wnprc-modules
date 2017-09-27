/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE INDEX IDX_project_container_project_protocol ON ehr.project (container, project, protocol);
CREATE INDEX IDX_project_container_project_investigatorid ON ehr.project (container, project, investigatorid);
CREATE INDEX IDX_protocol_container_protocol ON ehr.protocol (container, protocol);

CREATE INDEX IDX_container_taskid_formtype ON ehr.tasks (container, taskid, formtype);

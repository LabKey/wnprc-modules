/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE INDEX project_name_project ON ehr.project (name, project);

CREATE INDEX snomed_tags_code_container ON ehr.snomed_tags (code, container);

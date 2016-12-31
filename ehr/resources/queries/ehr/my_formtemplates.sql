/*
 * Copyright (c) 2011-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
    entityid,
    title,
    category,
    formType,
    userId,
    description,

FROM ehr.formtemplates t

WHERE (ISMEMBEROF(t.userId) or t.userid is null) AND (t.hidden IS NULL OR t.hidden != true)
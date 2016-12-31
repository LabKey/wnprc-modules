/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

taskid,
rowid,
updateTitle,
category,
title,
formtype,
qcstate,
assignedto,
duedate,
requestid,
datecompleted,
createdby,
created,
description


FROM ehr.tasks t

WHERE ISMEMBEROF(t.assignedto)
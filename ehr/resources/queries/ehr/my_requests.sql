/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

requestid,
rowid,
formtype,
title,
priority,
notify1,
notify2,
notify3,
pi,
createdby,
created,
description


FROM ehr.requests r

WHERE ISMEMBEROF(r.createdby)
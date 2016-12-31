/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

s.lsid,
cast(cast(s.date as DATE) AS timestamp) as DateOnly,

FROM study.studydata s
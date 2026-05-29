/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

s.lsid,
cast(cast(s.date as DATE) AS timestamp) as DateOnly,

FROM study.studydata s
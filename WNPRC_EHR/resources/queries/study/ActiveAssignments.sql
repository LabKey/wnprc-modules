/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


SELECT * from study.Assignment a
WHERE
(a.enddate is null or a.enddate >= curdate())
AND cast(a.date as date) <= curdate()
/*
 * Copyright (c) 2011-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


SELECT * from study.Assignment a
WHERE
(a.enddate is null or a.enddate >= curdate())
AND cast(a.date as date) <= curdate()
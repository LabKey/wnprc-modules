/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
id,
project,
count(*) as totalAssignments

FROM study.Assignment a
WHERE a.enddate is null
GROUP BY a.id, a.project
HAVING count (*) > 1


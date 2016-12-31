/*
 * Copyright (c) 2010-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 *
 * This query presents each animal's death date, combining values from the Deaths dataset
 * and information from the demographics record.  If an animal doesn't appear here, they never
 * died.
 */

SELECT
events.Id,
cast(events.date as DATE) as date, -- Ensure it's a date, not a timestamp
events.date as dateWithTime,
GROUP_CONCAT(DISTINCT events.remark, ';') as description

FROM (
    SELECT Id,date,remark FROM study.deaths
    WHERE (qcstate.publicdata = TRUE)
) as events

GROUP BY events.date, events.Id
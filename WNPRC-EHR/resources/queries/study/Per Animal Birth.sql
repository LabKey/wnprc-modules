/*
 * Copyright (c) 2010-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 *
 * This query presents each animal's birth date, combining values from the Birth dataset
 * and information from the demographics record.  If an animal's birth date appears here
 * as null, we don't know when the animal was born.
 */

SELECT demographics.Id, births.date, births.description,
CASE
    WHEN (demographics.origin = 'cen') THEN TRUE
    ELSE FALSE
END as bornAtCenter

FROM study.demographics as demographics

FULL JOIN (
    SELECT
    events.Id,
    cast(events.date as DATE) as date, -- Ensure it's a date, not a timestamp
    events.date as dateWithTime,
    GROUP_CONCAT(DISTINCT events.remark, ';') as description

    FROM (
        SELECT Id,date,remark FROM study.birth
        WHERE qcstate.publicdata = TRUE

        UNION

        SELECT
        Id,
        birth as date,
        '[calculated from demographics dataset]' as remark
        FROM study.demographics AS demographics
        WHERE demographics.birth IS NOT NULL
    ) as events

    GROUP BY events.date, events.Id
) as births
ON (births.Id = demographics.Id)
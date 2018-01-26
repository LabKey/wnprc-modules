/*
 * Copyright (c) 2010-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 *
 * This query presents a view of arrival, departure, death, and birth events, each with an associated
 * animal id.
 */

SELECT events.Id, events.date, events.dateWithTime, events.type, demographics.species, events.description
FROM (
    SELECT *,'arrival'   as type FROM study."Per Animal Arrival"
    UNION
    SELECT *,'departure' as type FROM study."Per Animal Departure"
    UNION
    SELECT *,'death'     as type FROM study."Per Animal Death"

    UNION

    SELECT Id,date,CAST(date as TIMESTAMP) as dateWithTime,description,'birth' as type
    FROM study."Per Animal Birth"
    WHERE (date IS NOT NULL)
) as events

LEFT JOIN study.demographics AS demographics
ON (events.Id = demographics.Id)
WHERE (demographics.calculated_status <> 'No Record') -- Animals with no record don't affect the population.
order by events.id asc, events.dateWithTime asc
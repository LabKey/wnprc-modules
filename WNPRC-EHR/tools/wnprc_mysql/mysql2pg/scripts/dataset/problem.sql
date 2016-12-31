/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, date(coalesce(FixDate(date_observed), '1979-01-01')) AS Date, (problem_no) AS problem_no, FixNewlines(description) AS remark, FixDate(date_observed) AS date_observed, FixDate(date_resolved) AS date_resolved, (c.code) AS code,
ts, uuid AS objectid
FROM cases c

where length(id) > 1
and description != '' and description is not null

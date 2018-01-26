/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
PARAMETERS (EntryDate TIMESTAMP)


SELECT Id, date, enddate, room, cage, cond  from study.housing h


WHERE

/*User must enter a date */
coalesce(ENTRYDATE, cast('1900-01-01 00:00:00.0' as timestamp)) > cast('1900-01-02 00:00:00.0' as timestamp)
and
/* entered date must be <= enddate */
ENTRYDATE <= coalesce(h.enddate, now())
and
/* entered date must be less than records enddate */
ENTRYDATE >= h.date
and
h.cond like '%s%'
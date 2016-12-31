/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
select

T1.Id,
max(T1.date) as MostRecentDeparture

FROM study.departure T1
WHERE T1.qcstate.publicdata = true
GROUP BY T1.Id

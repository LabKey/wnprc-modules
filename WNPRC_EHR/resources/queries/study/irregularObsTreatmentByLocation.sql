/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT

i.id,
i.area,
i.room,
i.cage,
i.date,
i.DateOnly,
'Obs' as type,
i.userid,
i.remark,
i.dataset,
i.description,
i.qcstate

from study.irregularObsByLocation i
where i.isIrregular = true

UNION ALL

SELECT

t.id,
t.CurrentArea as area,
t.CurrentRoom as room,
t.CurrentCage as Cage,
t.date,
cast(t.date as DATE) as DateOnly,
'Treatment' as type,
t.performedby,
t.remark,
t.dataset,
t.description2,
treatmentStatus as qcstate

FROM treatmentSchedule t



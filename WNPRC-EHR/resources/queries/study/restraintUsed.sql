/*
 * Copyright (c) 2011-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
a.id,
max(a.date) as date,
max(a.enddate) as enddate,
max(a.project) as project,
max(a.restraint) as restraint,
max(restraintCode) as restraintCode,
-- max(a.restraintTime) as restraintTime,
max(restraintDuration) as restraintDuration,
a.taskid,
a.formtype as formtype

FROM (

select
id, date, enddate, project, restraint, restraint.code as restraintCode, restraintDuration, remark, taskid, taskid.formtype
from study."Blood Draws" b
where taskid is not null
and b.restraint is not null
AND b.restraint.include = true

UNION ALL

select
id, date, enddate, project, restraint, restraint.code as restraintCode, restraintDuration, remark, taskid, taskid.formtype
from study."Drug Administration" b
where taskid is not null
and b.restraint is not null
AND b.restraint.include = true

UNION ALL

select
id, date, enddate, project, restraint, restraint.code as restraintCode, restraintDuration, remark, taskid, taskid.formtype
from study."Clinical Encounters" b
where taskid is not null
and b.restraint is not null
AND b.restraint.include = true

) a
group by a.id, a.taskid, a.formtype

UNION ALL

select
id, date, enddate, project, null as restraint, code as restraintCode, null as restraintDuration, taskid, taskid.formtype
from study."Drug Administration" b
where taskid is null AND b.code IN ('w-10238', 'w-10239', 'w-10240', 'w-10241')
;
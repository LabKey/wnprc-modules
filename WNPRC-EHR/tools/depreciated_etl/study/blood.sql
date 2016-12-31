/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, FixDateTime(date, time) AS Date, quantity, done_by as performedby, done_for as requestor, pno as project, p_s, a_v, (b.code) AS assayCode, caretaker as billedby, tube_type, null as parentid,
     b.ts, b.uuid AS objectid

FROM blood b


WHERE b.ts > ?
AND length(b.id) > 1
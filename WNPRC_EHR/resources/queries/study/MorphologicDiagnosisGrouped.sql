/*
 * Copyright (c) 2011-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
n.Id,
n.date,
n.seq1,
n.caseno.caseno,
group_concat(n.remark) as diagnosis,
group_concat(n.tissue.meaning) as tissue,
group_concat(n.tissue_qualifier) as tissue_qualifier,
-- group_concat(n.severity.meaning) as severity,
-- group_concat(n.duration.meaning) as duration,
-- group_concat(n.distribution.meaning) as distribution,
-- group_concat(n.distribution2.meaning) as distribution2,
group_concat(n.inflammation.meaning) as inflammation,
group_concat(n.inflammation.meaning) as inflammation2,
--group_concat(n.etiology.meaning) as etiology,
group_concat(n.process.meaning) as process,
group_concat(n.process2.meaning) as process2,
FROM "Morphologic Diagnosis" n
where n.qcstate.publicdata = true
group by n.id, n.date, n.seq1, n.caseno.caseno
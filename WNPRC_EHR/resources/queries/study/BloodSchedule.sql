/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
b.lsid,
b.id,
b.date,
cast(b.date as DATE) as dateOnly,
b.daterequested,
b.project,
b.performedby,
b.assayCode,
b.requestor,
b.billedby,
b.tube_vol,
b.tube_type,
b.num_tubes,
b.quantity,
b.additionalServices,
b.instructions,
b.remark,
b.qcstate,
b.taskid,
b.requestid,
b.objectid,
CASE
  WHEN (b.project = 300901 OR b.project = 400901 OR a1.project is not null) THEN null
  ELSE 'NOT ASSIGNED'
END AS projectStatus,
CASE
  WHEN (b.qcstate.PublicData = true) THEN 'Completed'
  WHEN (b.qcstate.Label = 'Request: Denied') THEN 'Denied'
  WHEN (b.qcstate.metadata.DraftData = true) THEN 'Pending'
  ELSE 'Not Approved'
END as drawStatus



from study."Blood Draws" b

LEFT JOIN study.assignment a1
  ON (a1.project = b.project AND cast(a1.date as date)  <= cast(b.date as date) AND (a1.enddate is null or cast(COALESCE(a1.enddate, curdate()) as date) >= cast(b.date as date)) AND a1.id = b.id)


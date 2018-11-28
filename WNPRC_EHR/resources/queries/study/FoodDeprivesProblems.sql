SELECT
fd.id,
fd.date,
fd.schedule,
fd.id.curLocation.room AS room,
fd.id.curLocation.cage AS cage,
fd.assignedTo,
fd.protocolContact,
fd.reason,
fd.qcstate

FROM study.foodDeprives fd
WHERE
fd.id.dataset.demographics.calculated_status = 'Alive' AND
CAST(fd.date AS date) = CAST(curdate() AS date)
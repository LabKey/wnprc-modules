SELECT
fd.id,
fd.date,
fd.schedule,
fd.id.demographics.room AS room,
fd.id.demographics.cage AS cage,
fd.assignedTo,
fd.protocolContact,
fd.reason,
fd.qcstate

FROM study.foodDeprives fd
WHERE
fd.id.dataset.demographics.calculated_status = 'Alive' AND
fd.date = curdate()
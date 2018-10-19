SELECT
fd.id,
fd.date,
fd.schedule,
fd.id.demographics.room,
fd.id.demographics.cage,
fd.assignedTo,
fd.protocolContact,
fd.reason

FROM study.foodDeprives fd
WHERE
fd.id.dataset.demographics.calculated_status = 'Alive' AND
fd.qcstate.label = 'Scheduled' AND
fd.date = curdate()
SELECT
fd.id,
fd.date,
fd.schedule,
fd.depriveStartTime,
fd.restoredTime,
TRUNCATE(CAST(timestampdiff(SQL_TSI_HOUR,fd.depriveStartTime,coalesce(fd.restoredTime,now())) AS NUMERIC),2)  AS hoursSinceStarted,
fd.id.curLocation.room AS room,
fd.id.curLocation.cage AS cage,
fd.assignedTo,
fd.protocolContact,
fd.reason,
fd.qcstate

FROM study.foodDeprives fd
WHERE
fd.id.dataset.demographics.calculated_status = 'Alive' AND
fd.qcstate.label != 'Scheduled'
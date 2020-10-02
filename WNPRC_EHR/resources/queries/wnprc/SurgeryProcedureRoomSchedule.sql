SELECT rowid,
       room,
       room_type,
       date,
       enddate,
       appt_id,
       requestid,
       requestid.qcstate.label as qclabel
FROM wnprc.procedure_scheduled_rooms
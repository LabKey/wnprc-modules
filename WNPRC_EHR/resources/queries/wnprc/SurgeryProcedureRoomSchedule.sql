SELECT objectid,
       room,
       room_type,
       date,
       enddate,
       event_id,
       requestid,
       requestid.qcstate.label as qclabel
FROM wnprc.procedure_scheduled_rooms
SELECT objectid,
       room,
       room.email,
       room.default_bg_color,
       date,
       enddate,
       event_id,
       requestid,
       requestid.qcstate.label as qclabel
FROM wnprc.procedure_scheduled_rooms
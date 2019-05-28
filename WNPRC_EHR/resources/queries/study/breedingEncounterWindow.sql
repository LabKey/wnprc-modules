SELECT lsid, to_char(date, 'Mon DD, YYYY HH24:MI') || ' to' || chr(10) || COALESCE(to_char(enddate, 'Mon DD, YYYY HH24:MI'), 'Ongoing') AS window
FROM study.breeding_encounters
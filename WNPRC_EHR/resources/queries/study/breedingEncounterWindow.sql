SELECT lsid, to_char(date, 'Mon DD, YYYY HH24:MI') || ' to' || chr(10) || to_char(enddate, 'Mon DD, YYYY HH24:MI') AS window
FROM study.breeding_encounters
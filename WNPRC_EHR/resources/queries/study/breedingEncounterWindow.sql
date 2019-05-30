SELECT lsid, to_char(date, 'yyyy-MM-dd HH24:MI') || ' to ' || COALESCE(to_char(enddate, 'yyyy-MM-dd HH24:MI'), 'Ongoing') AS window
FROM study.breeding_encounters
PARAMETERS ( PARENT_RECORD_ID VARCHAR )
SELECT
  u.date,
  u.performedby,
  u.remark
FROM ultrasounds u
WHERE u.pregnancyid = (SELECT p.lsid
                       FROM pregnancies p
                       WHERE p.objectid = PARENT_RECORD_ID
                       LIMIT 1)
ORDER BY u.date DESC
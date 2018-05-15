PARAMETERS ( PARENT_RECORD_ID VARCHAR )
SELECT
  u.date,
  u.performedby,
  u.project,
  u.restraint,
  u.fetal_heartbeat,
  u.beats_per_minute,
  u.crown_rump_cm,
  u.head_circumference_cm,
  u.femur_length_cm,
  u.biparietal_diameter_cm,
  u.remark
FROM ultrasounds u
WHERE u.pregnancyid = (SELECT p.lsid
                       FROM pregnancies p
                       WHERE p.objectid = PARENT_RECORD_ID
                       LIMIT 1)
ORDER BY u.date DESC
PARAMETERS ( PARENT_RECORD_ID VARCHAR )
SELECT
  u.date,
  u.project,
  u.restraint,
  u.fetal_heartbeat,
  u.beats_per_minute,
  u.gest_sac_mm,
  u.gest_sac_gest_day,
  u.crown_rump_mm,
  u.crown_rump_gest_day,
  u.biparietal_diameter_mm,
  u.biparietal_diameter_gest_day,
  u.femur_length_mm,
  u.femur_length_gest_day,
  u.yolk_sac_diameter_mm,
  u.head_circumference_mm,
  u.code,
  u.remark,
  u.performedby,
  u.followup_required
FROM ultrasounds u
WHERE u.pregnancyid = (SELECT p.lsid
                       FROM pregnancies p
                       WHERE p.objectid = PARENT_RECORD_ID
                       LIMIT 1)
ORDER BY u.date DESC
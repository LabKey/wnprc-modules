PARAMETERS ( PARENT_RECORD_ID VARCHAR )
SELECT
  um.date,
  um.measurement_label,
  um.measurement_value,
  um.measurement_unit
FROM ultrasound_measurements um
WHERE um.ultrasound_id = PARENT_RECORD_ID
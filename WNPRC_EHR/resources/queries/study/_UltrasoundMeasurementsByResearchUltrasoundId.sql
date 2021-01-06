PARAMETERS ( PARENT_RECORD_ID VARCHAR )
SELECT
  um.date,
  um.measurement_label,
  um.measurement_value,
  um.measurement_unit,
  (SELECT ROUND(AVG(um2.measurement_value), 2)
    FROM ultrasound_measurements um2
    WHERE um2.ultrasound_id = PARENT_RECORD_ID
    AND um2.measurement_name = um.measurement_name
    GROUP BY measurement_label, measurement_unit) AS measurement_averages
FROM ultrasound_measurements um
WHERE um.ultrasound_id = PARENT_RECORD_ID
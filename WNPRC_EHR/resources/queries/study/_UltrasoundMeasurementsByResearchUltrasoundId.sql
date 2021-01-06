PARAMETERS ( PARENT_RECORD_ID VARCHAR )
SELECT
  um.ultrasound_id,
  um.date,
  um.measurement_label,
  um.measurement_value,
  um.measurement_unit,
  (SELECT ROUND(AVG(um2.measurement_value), 2)
    FROM ultrasound_measurements um2
    WHERE um2.ultrasound_id = PARENT_RECORD_ID
    AND um2.measurement_name = um.measurement_name
    GROUP BY measurement_label, measurement_unit) AS measurement_averages,
  CASE WHEN EXISTS(SELECT 1 FROM pregnancy_outcomes po WHERE (SELECT ru.pregnancyid FROM study.research_ultrasounds ru WHERE ru.objectid = PARENT_RECORD_ID) = po.pregnancyid)
          THEN 'Pregnancy Completed'
       WHEN EXISTS(SELECT 1 FROM pregnancies p WHERE (SELECT ru.pregnancyid FROM study.research_ultrasounds ru WHERE ru.objectid = PARENT_RECORD_ID) = p.lsid)
          THEN CONCAT(CAST((SELECT timestampdiff('SQL_TSI_DAY', p.date_conception, (SELECT ru.date FROM study.research_ultrasounds ru WHERE ru.objectid = PARENT_RECORD_ID))
                            FROM pregnancies p
                            WHERE (SELECT ru.pregnancyid FROM study.research_ultrasounds ru WHERE ru.objectid = PARENT_RECORD_ID) = p.lsid) AS VARCHAR), ' day(s)')
          ELSE 'No Associated Pregnancy'
  END AS gestation_day
FROM ultrasound_measurements um
WHERE um.ultrasound_id = PARENT_RECORD_ID
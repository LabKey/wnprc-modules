PARAMETERS ( SPECIES VARCHAR, SEARCH_COLUMN_NAME VARCHAR, SEARCH_VALUE FLOAT )

SELECT gestational_day
FROM wnprc.gestational_days a
WHERE a.species = SPECIES AND EXISTS(SELECT 1
                                     FROM wnprc.gestational_days b
                                     WHERE b.species = SPECIES AND (CASE
                                                                    WHEN SEARCH_COLUMN_NAME = 'gest_sac_mm'
                                                                      THEN (abs(SEARCH_VALUE - b.gest_sac_mm) <= 1.3)
                                                                    WHEN SEARCH_COLUMN_NAME = 'crown_rump_mm'
                                                                      THEN (abs(SEARCH_VALUE - b.crown_rump_mm) <= 2.8)
                                                                    WHEN SEARCH_COLUMN_NAME = 'biparietal_diameter_mm'
                                                                      THEN (abs(SEARCH_VALUE - b.biparietal_diameter_mm) <= 1.5)
                                                                    WHEN SEARCH_COLUMN_NAME = 'femur_length_mm'
                                                                      THEN (abs(SEARCH_VALUE - b.femur_length_mm) <= 1.5)
                                                                    ELSE FALSE
                                                                    END))
ORDER BY
  CASE
  WHEN SEARCH_COLUMN_NAME = 'gest_sac_mm'
    THEN abs(SEARCH_VALUE - a.gest_sac_mm)
  WHEN SEARCH_COLUMN_NAME = 'crown_rump_mm'
    THEN abs(SEARCH_VALUE - a.crown_rump_mm)
  WHEN SEARCH_COLUMN_NAME = 'biparietal_diameter_mm'
    THEN abs(SEARCH_VALUE - a.biparietal_diameter_mm)
  WHEN SEARCH_COLUMN_NAME = 'femur_length_mm'
    THEN abs(SEARCH_VALUE - a.femur_length_mm)
  END ASC
LIMIT 1
PARAMETERS ( SPECIES VARCHAR, SEARCH_COLUMN_NAME VARCHAR , SEARCH_VALUE FLOAT)

SELECT gestational_day
FROM wnprc.gestational_days
WHERE species = SPECIES
ORDER BY
  CASE
  WHEN SEARCH_COLUMN_NAME = 'gest_sac_mm' THEN abs(SEARCH_VALUE - gest_sac_mm)
  WHEN SEARCH_COLUMN_NAME = 'crown_rump_mm' THEN abs(SEARCH_VALUE - crown_rump_mm)
  WHEN SEARCH_COLUMN_NAME = 'biparietal_diameter_mm' THEN abs(SEARCH_VALUE - biparietal_diameter_mm)
  WHEN SEARCH_COLUMN_NAME = 'femur_length_mm' THEN abs(SEARCH_VALUE - femur_length_mm)
  ELSE -1
END ASC
LIMIT 1
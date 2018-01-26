SELECT *
FROM (
  SELECT Id, dateOnly, "value", title
  FROM ehr_lookups.obs_feces feces_opts, study."DiarrheaObs" feces_obs
  WHERE  ',' || feces || ',' like '%,' || value || ',%'
)
ORDER BY dateOnly DESC

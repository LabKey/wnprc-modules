insert into ehr_lookups.species (common, scientific_name, id_prefix, mhc_prefix, blood_per_kg, max_draw_pct, blood_draw_interval, container)
    SELECT common, scientific_name, id_prefix, mhc_prefix, blood_per_kg, max_draw_pct, blood_draw_interval, container FROM
    (SELECT
       'Macaque' AS common,
       '' AS scientific_name,
       '' as id_prefix,
       '' as mhc_prefix,
       60.0 AS blood_per_kg,
       0.2 as max_draw_pct,
       30.0 as blood_draw_interval,
      MAX(Container) as container FROM ehr_lookups.species)
  x WHERE container IS NOT NULL;
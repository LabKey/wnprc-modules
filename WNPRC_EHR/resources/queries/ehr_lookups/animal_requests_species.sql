SELECT species.common,
species.scientific_name,
species.id_prefix,
species.mhc_prefix,
species.blood_per_kg,
species.max_draw_pct,
species.blood_draw_interval,
species.cites_code,
species.dateDisabled,
species.USDA,
species.Gestation
FROM ehr_lookups.species

where species.common in ('Cynomolgus','Rhesus','Marmoset')
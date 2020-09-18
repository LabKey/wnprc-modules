SELECT
  bt.value,
  bt.description
FROM ehr_lookups.birth_type bt
WHERE (bt.date_disabled IS NULL) OR (curdate() < bt.date_disabled);
SELECT
CAST(score.value as DOUBLE) as code,
score.value || ': ' || score.description as display

FROM ehr_lookups.alopecia_score score
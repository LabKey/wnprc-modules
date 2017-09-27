SELECT
CAST(bcs.value as DOUBLE) as code,
bcs.title || ' (' || bcs.value || ')' as display

FROM ehr_lookups.bcs_score bcs
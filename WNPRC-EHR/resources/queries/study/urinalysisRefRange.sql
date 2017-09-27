/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

c.lsid,
c.id,
c.date,
c.gender,
c.species,
c.method,
c.testId,
c.alertOnAbnormal,
c.alertOnAny,
c.result,
c.resultOORIndicator,
c.qualresult,
c.AgeAtTime,
ac.ageClass,
r.ref_range_min,
r.ref_range_max,
c.remark,
cast(truncate(round(cast(convert(r.ref_range_min, double) AS Numeric), 2),2) as varchar) || '-' || cast(truncate(round(cast(convert(r.ref_range_max, double) AS Numeric), 2),2) as varchar) as range,
CASE
  WHEN convert(c.result, double) >= r.ref_range_min AND convert(c.result, double) <= r.ref_range_max
    THEN 'Normal'
  WHEN convert(c.result, double) < r.ref_range_min
    THEN 'Low'
  WHEN convert(c.result, double) > r.ref_range_max
    THEN 'High'
END as status,
c.taskid,
c.runId,
c.qcstate

FROM (
    SELECT
    c.lsid,
    c.id.dataset.demographics.gender as gender,
    c.id.dataset.demographics.species as species,
    c.method,
    c.testId,
    c.testid.alertOnAbnormal as alertOnAbnormal,
    c.testid.alertOnAny as alertOnAny,
    c.result,
    c.resultOORIndicator,
    c.qualresult,
    c.taskid,
    c.remark,
    c.qcstate,
    c.id,
    c.date,
    c.runId,
    ROUND(CONVERT(age_in_months(c.id.dataset.demographics.birth, c.date), DOUBLE) / 12.0, 1) as ageAtTime
    FROM "Urinalysis Results" c
    WHERE c.qcstate.publicdata = true
) c

LEFT JOIN ehr_lookups.ageclass ac ON (
  c.ageAtTime >= ac."min" AND
  (c.ageAtTime < ac."max" OR ac."max" is null) AND
  c.species = ac.species
)

LEFT JOIN ehr_lookups.lab_test_range r ON (
  c.testId = r.test AND
  c.species = r.species AND
  ac.ageClass = r.age_class AND
  c.gender = r.gender and
  r.type = 'Urinalysis'
)


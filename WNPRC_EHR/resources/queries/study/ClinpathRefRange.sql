/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT c2.*,

case
  when c2.alertOnAny = true then true
  when (c2.alertOnAbnormal = true AND (c2.status='Low' or c2.status='High')) then true
  else false
end as alertStatus

FROM (

SELECT

c.lsid,
c.id,
c.date,
c.gender,
c.species,
c.testId,
c.AgeAtTime,
c.ageClass,
c.result,
c.resultOORIndicator,
c.ref_range_min,
c.ref_range_max,
c.range,
c.status,
c.taskid,
c.qcstate,
c.alertOnAbnormal,
c.alertOnAny,
'Chemistry' as dataset,
'Chemistry_'||c.testid as test_key,
from study.chemistryRefRange c

union all

SELECT

c.lsid,
c.id,
c.date,
c.gender,
c.species,
c.testId,
c.AgeAtTime,
c.ageClass,
c.result,
c.resultOORIndicator,
c.ref_range_min,
c.ref_range_max,
c.range,
c.status,
c.taskid,
c.qcstate,
c.alertOnAbnormal,
c.alertOnAny,
'Hematology' as dataset,
'Hematology_'||c.testid as test_key,
from study.hematologyRefRange c

union all

SELECT

c.lsid,
c.id,
c.date,
c.gender,
c.species,
c.testId,
c.AgeAtTime,
c.ageClass,
c.result,
c.resultOORIndicator,
c.ref_range_min,
c.ref_range_max,
c.range,
c.status,
c.taskid,
c.qcstate,
c.alertOnAbnormal,
c.alertOnAny,
'Immunology' as dataset,
'Immunology_'||c.testid as test_key,
from study.immunologyRefRange c

union all

SELECT

c.lsid,
c.id,
c.date,
c.gender,
c.species,
c.testId,
c.AgeAtTime,
c.ageClass,
c.result,
c.resultOORIndicator,
c.ref_range_min,
c.ref_range_max,
c.range,
c.status,
c.taskid,
c.qcstate,
c.alertOnAbnormal,
c.alertOnAny,
'Urinalysis' as dataset,
'Urinalysis_'||c.testid as test_key,
from study.urinalysisRefRange c

) c2


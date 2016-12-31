/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
*,
s.lsid || '||' || s.date as primaryKey2,
s.objectid || '||' || s.date as primaryKey,
null as initials,
null as restraint,
null as time,
(SELECT max(d.qcstate) as label FROM study.drug d WHERE (s.objectid || '||' || s.date) = d.parentid) as treatmentStatus,
(SELECT max(taskId) as taskId FROM study.drug d WHERE (s.objectid || '||' || s.date) = d.parentid) as taskId


FROM (
SELECT
t1.lsid,
t1.objectid,
t1.dataset,
t1.id,
-- t1.id.curLocation.room as CurrentArea,
-- t1.id.curLocation.room as CurrentRoom,
-- t1.id.curLocation.cage as CurrentCage,

t1.id.dataset.activehousing.area as CurrentArea,
t1.id.dataset.activehousing.room as CurrentRoom,
t1.id.dataset.activehousing.cage as CurrentCage,

CASE
  --these are AM,
  WHEN (t1.frequency.meaning='Daily - AM' OR t1.frequency.meaning='Weekly - AM' OR t1.frequency.meaning='Monthly' or t1.frequency.meaning like 'Alternating Days%' or t1.frequency.meaning='Daily - Any Time')
    THEN timestampadd('SQL_TSI_HOUR', 8, d.date)
  --these are the multiple per day options
  WHEN (t1.frequency.meaning='Daily - AM/PM' OR t1.frequency.meaning='Daily - AM/PM/Night' OR t1.frequency.meaning='Daily - AM/Night')
    THEN timestampadd('SQL_TSI_HOUR', 8, d.date)
  --noon
  WHEN (t1.frequency.meaning='Daily - Noon')
    THEN timestampadd('SQL_TSI_HOUR', 12, d.date)
  WHEN (t1.frequency.meaning='Daily - PM' OR t1.frequency.meaning='Weekly - PM')
    THEN timestampadd('SQL_TSI_HOUR', 14, d.date)
  WHEN (t1.frequency.meaning='Daily - Night')
    THEN timestampadd('SQL_TSI_HOUR', 19, d.date)
END as date,

t1.frequency.meaning as frequency,
t1.date as StartDate,
t1.enddate,
t1.project,
CASE
  WHEN (t1.project = 300901 OR t1.project = 400901 OR a1.project is not null) THEN null
  ELSE 'NOT ASSIGNED'
END AS projectStatus,
t1.meaning,
t1.code,

case
  WHEN (t1.volume is null or t1.volume = 0)
    THEN null
  else
    (TRUNCATE(round(CAST(t1.volume AS NUMERIC),2),2) || ' ' || t1.vol_units)
END as volume2,
t1.volume,
t1.vol_units,
case
  WHEN (t1.concentration is null or t1.concentration = 0)
    THEN null
  else
    (TRUNCATE(ROUND(CAST(t1.concentration AS NUMERIC),2),2) || ' ' || t1.conc_units)
END as conc2,
t1.concentration,
t1.conc_units,
case
  WHEN (t1.amount is null or t1.amount = 0)
    THEN null
  else
    (TRUNCATE(ROUND(CAST(t1.amount AS NUMERIC),2),2) || ' ' || t1.amount_units)
END as amount2,
t1.amount,
t1.amount_units,
case
  WHEN (t1.dosage is null or t1.dosage = 0)
    THEN null
  else
    (CONVERT(t1.dosage, float) || ' ' || t1.dosage_units)
END as dosage2,
t1.dosage,
t1.dosage_units,
t1.qualifier,

t1.route,
t1.performedby,
t1.remark,
t1.description,
CASE WHEN t1.enddate is null AND t1.meaning IS null AND t1.code.meaning IS null THEN
  ('Drug: ' || t1.code)
WHEN t1.enddate is null AND t1.meaning IS NOT null THEN
  ('Drug: ' || t1.meaning || ' (' || t1.code || ')')
WHEN t1.enddate is null AND t1.code.meaning IS NOT null THEN
  ('Drug: ' || t1.code.meaning || ' (' || t1.code || ')')
WHEN t1.enddate is not null AND t1.meaning IS NOT null THEN
  ('Drug: ' || t1.meaning || ' (' || t1.code || ')' || chr(10) || 'End Date: ' || convert(t1.enddate, varchar))
WHEN t1.enddate is not null AND t1.code.meaning IS NOT null THEN
  ('Drug: ' || t1.code.meaning || ' (' || t1.code || ')' || chr(10) || 'End Date: ' || convert(t1.enddate, varchar))
ELSE
  ('Drug: ' || t1.code || chr(10) || 'End Date: ' || convert(t1.enddate, varchar))
END AS description2,
t1.qcstate,

CASE
  WHEN (t1.frequency.meaning='Daily - AM' OR t1.frequency.meaning='Weekly - AM' OR t1.frequency.meaning='Monthly' or t1.frequency.meaning='Alternating Days - AM')
    THEN 'AM'
  --these are the multiple per day options
  WHEN (t1.frequency.meaning='Daily - AM/PM' OR t1.frequency.meaning='Daily - AM/PM/Night' OR t1.frequency.meaning='Daily - AM/Night')
    THEN 'AM'
  WHEN (t1.frequency.meaning='Daily - Noon')
    THEN 'Noon'
  WHEN (t1.frequency.meaning='Daily - Any Time')
    THEN 'Any Time'
  WHEN (t1.frequency.meaning='Daily - PM' OR t1.frequency.meaning='Alternating Days - PM' OR t1.frequency.meaning='Weekly - PM')
    THEN 'PM'
  WHEN (t1.frequency.meaning='Daily - Night')
    THEN 'Night'
END as TimeOfDay,

CASE
  WHEN (t1.frequency.meaning='Daily - AM' OR t1.frequency.meaning='Weekly - AM' OR t1.frequency.meaning='Monthly' OR t1.frequency.meaning='Alternating Days - AM' or t1.frequency.meaning='Daily - Any Time')
    THEN 1
  --these are the multiple per day options
  WHEN (t1.frequency.meaning='Daily - AM/PM' OR t1.frequency.meaning='Daily - AM/PM/Night' OR t1.frequency.meaning='Daily - AM/Night')
    THEN 1
  WHEN (t1.frequency.meaning='Daily - Noon')
    THEN 2
  WHEN (t1.frequency.meaning='Daily - PM' OR t1.frequency.meaning='Alternating Days - PM' OR t1.frequency.meaning='Weekly - PM')
    THEN 3
  WHEN (t1.frequency.meaning='Daily - Night')
    THEN 4
END as SortOrder

FROM ehr_lookups.next30Days d

LEFT JOIN study."Treatment Orders" t1
  ON (d.date >= t1.date and (d.date <= cast(t1.enddate as date) OR t1.enddate is null) AND (
  --daily
  (t1.frequency.meaning='Daily - AM' OR t1.frequency.meaning='Daily - AM/PM' OR t1.frequency.meaning='Daily - AM/PM/Night' OR t1.frequency.meaning='Daily - PM' OR t1.frequency.meaning='Daily - Night' OR t1.frequency.meaning='Daily - AM/Night' OR t1.frequency.meaning='Daily - Noon' OR t1.frequency.meaning='Daily - Any Time')
  OR
  --monthly
  --always 1st tues
  (t1.frequency.meaning='Monthly' AND d.dayofmonth<=7 AND d.dayofweek=3)
  OR
  --weekly
  --always on same day as start date
  (t1.frequency.meaning='Weekly - AM' AND d.dayofweek=dayofweek(t1.date))

  OR
  (t1.frequency.meaning='Weekly - PM' AND d.dayofweek=dayofweek(t1.date))

  OR
  --alternating days.  relative to start date
  (t1.frequency.meaning like '%Alternating Days%' AND mod(d.dayofyear,2)=mod(cast(dayofyear(t1.date) as integer),2))
  ))
LEFT JOIN study.assignment a1
  ON (a1.project = t1.project AND cast(a1.date as date) <= cast(d.date as date) AND (a1.enddate is null or COALESCE(a1.enddate, curdate()) >= d.date) AND a1.id = t1.id)
WHERE t1.date is not null
AND t1.qcstate.publicdata = true

--clunky, but it will add the second time for twice dailies
UNION ALL

SELECT
t1.lsid,
t1.objectid,
t1.dataset,
t1.id,
-- t1.id.curLocation.room as CurrentArea,
-- t1.id.curLocation.room as CurrentRoom,
-- t1.id.curLocation.cage as CurrentCage,

t1.id.dataset.activehousing.area as CurrentArea,
t1.id.dataset.activehousing.room as CurrentRoom,
t1.id.dataset.activehousing.cage as CurrentCage,

CASE
  WHEN (t1.frequency.meaning='Daily - AM/PM' OR t1.frequency.meaning='Daily - AM/PM/Night')
    THEN timestampadd('SQL_TSI_HOUR', 14, d.date)
  WHEN (t1.frequency.meaning='Daily - AM/Night')
    THEN timestampadd('SQL_TSI_HOUR', 19, d.date)
END as date,

t1.frequency.meaning as frequency,
t1.date as StartDate,
t1.enddate,
t1.project,
CASE
  WHEN (t1.project = 300901 OR t1.project = 400901 OR a1.project is not null) THEN null
  ELSE 'NOT ASSIGNED'
END AS projectStatus,
t1.meaning,
t1.code,

case
  WHEN (t1.volume is null or t1.volume = 0)
    THEN null
  else
    (TRUNCATE(round(CAST(t1.volume AS NUMERIC),2),2) || ' ' || t1.vol_units)
END as volume2,
t1.volume,
t1.vol_units,
case
  WHEN (t1.concentration is null or t1.concentration = 0)
    THEN null
  else
    (TRUNCATE(ROUND(CAST(t1.concentration AS NUMERIC),2),2) || ' ' || t1.conc_units)
END as conc2,
t1.concentration,
t1.conc_units,
case
  WHEN (t1.amount is null or t1.amount = 0)
    THEN null
  else
    (TRUNCATE(ROUND(CAST(t1.amount AS NUMERIC),2),2) || ' ' || t1.amount_units)
END as amount2,
t1.amount,
t1.amount_units,
case
  WHEN (t1.dosage is null or t1.dosage = 0)
    THEN null
  else
    (CONVERT(t1.dosage, float) || ' ' || t1.dosage_units)
END as dosage2,
t1.dosage,
t1.dosage_units,
t1.qualifier,

t1.route,
t1.performedby,
t1.remark,
t1.description,
CASE WHEN t1.enddate is null AND t1.meaning IS null AND t1.code.meaning IS null THEN
  ('Drug: ' || t1.code)
WHEN t1.enddate is null AND t1.meaning IS NOT null THEN
  ('Drug: ' || t1.meaning || ' (' || t1.code || ')')
WHEN t1.enddate is null AND t1.code.meaning IS NOT null THEN
  ('Drug: ' || t1.code.meaning || ' (' || t1.code || ')')
WHEN t1.enddate is not null AND t1.meaning IS NOT null THEN
  ('Drug: ' || t1.meaning || ' (' || t1.code || ')' || chr(10) || 'End Date: ' || convert(t1.enddate, varchar))
WHEN t1.enddate is not null AND t1.code.meaning IS NOT null THEN
  ('Drug: ' || t1.code.meaning || ' (' || t1.code || ')' || chr(10) || 'End Date: ' || convert(t1.enddate, varchar))
ELSE
  ('Drug: ' || t1.code || chr(10) || 'End Date: ' || convert(t1.enddate, varchar))
END AS description2,
t1.qcstate,

CASE
  WHEN (t1.frequency.meaning='Daily - AM/PM' OR t1.frequency.meaning='Daily - AM/PM/Night')
    THEN 'PM'
  WHEN (t1.frequency.meaning='Daily - AM/Night')
    THEN 'Night'
END as TimeOfDay,

CASE
  WHEN (t1.frequency.meaning='Daily - AM/PM' OR t1.frequency.meaning='Daily - AM/PM/Night')
    THEN 3
  WHEN (t1.frequency.meaning='Daily - AM/Night')
    THEN 4
END as SortOrder

FROM ehr_lookups.next30Days d

LEFT JOIN study."Treatment Orders" t1
  ON (d.date >= t1.date and (d.date <= cast(t1.enddate as date) OR t1.enddate is null) AND (
  --duplicate the daily ones
  (t1.frequency.meaning='Daily - AM/PM' OR t1.frequency.meaning='Daily - AM/PM/Night' OR t1.frequency.meaning='Daily - AM/Night')
  ))
LEFT JOIN study.assignment a1
  ON (a1.project = t1.project AND cast(a1.date as date) <= cast(d.date as date) AND (a1.enddate is null or COALESCE(a1.enddate, curdate()) >= d.date) AND a1.id = t1.id)

WHERE t1.date is not null
AND t1.qcstate.publicdata = true

--clunkier still, but will add the third per day dose
UNION ALL

SELECT
t1.lsid,
t1.objectid,
t1.dataset,
t1.id,
-- t1.id.curLocation.room as CurrentArea,
-- t1.id.curLocation.room as CurrentRoom,
-- t1.id.curLocation.cage as CurrentCage,

t1.id.dataset.activehousing.area as CurrentArea,
t1.id.dataset.activehousing.room as CurrentRoom,
t1.id.dataset.activehousing.cage as CurrentCage,

timestampadd('SQL_TSI_HOUR', 19, d.date) as date,
t1.frequency.meaning as frequency,
t1.date as StartDate,
t1.enddate,
t1.project,
CASE
  WHEN (t1.project = 300901 OR t1.project = 400901 OR a1.project is not null) THEN null
  ELSE 'NOT ASSIGNED'
END AS projectStatus,
t1.meaning,
t1.code,

case
  WHEN (t1.volume is null or t1.volume = 0)
    THEN null
  else
    (CONVERT(t1.volume, float) || ' ' || t1.vol_units)
END as volume2,
t1.volume,
t1.vol_units,
case
  WHEN (t1.concentration is null or t1.concentration = 0)
    THEN null
  else
    (CONVERT(t1.concentration, float) || ' ' || t1.conc_units)
END as conc2,
t1.concentration,
t1.conc_units,
case
  WHEN (t1.amount is null or t1.amount = 0)
    THEN null
  else
    (CONVERT(t1.amount, float) || ' ' || t1.amount_units)
END as amount2,
t1.amount,
t1.amount_units,
case
  WHEN (t1.dosage is null or t1.dosage = 0)
    THEN null
  else
    (CONVERT(t1.dosage, float) || ' ' || t1.dosage_units)
END as dosage2,
t1.dosage,
t1.dosage_units,
t1.qualifier,
t1.route,
t1.performedby,
t1.remark,
t1.description,
CASE WHEN t1.enddate is null AND t1.meaning IS null AND t1.code.meaning IS null THEN
  ('Drug: ' || t1.code)
WHEN t1.enddate is null AND t1.meaning IS NOT null THEN
  ('Drug: ' || t1.meaning || ' (' || t1.code || ')')
WHEN t1.enddate is null AND t1.code.meaning IS NOT null THEN
  ('Drug: ' || t1.code.meaning || ' (' || t1.code || ')')
WHEN t1.enddate is not null AND t1.meaning IS NOT null THEN
  ('Drug: ' || t1.meaning || ' (' || t1.code || ')' || chr(10) || 'End Date: ' || convert(t1.enddate, varchar))
WHEN t1.enddate is not null AND t1.code.meaning IS NOT null THEN
  ('Drug: ' || t1.code.meaning || ' (' || t1.code || ')' || chr(10) || 'End Date: ' || convert(t1.enddate, varchar))
ELSE
  ('Drug: ' || t1.code || chr(10) || 'End Date: ' || convert(t1.enddate, varchar))
END AS description2,
t1.qcstate,

'Night' as TimeOfDay,

4 as SortOrder

FROM ehr_lookups.next30Days d

LEFT JOIN study."Treatment Orders" t1
  ON (d.date >= t1.date and (d.date <= cast(t1.enddate as date) OR t1.enddate is null) AND
    t1.frequency.meaning='Daily - AM/PM/Night'
  )
LEFT JOIN study.assignment a1
  ON (a1.project = t1.project AND cast(a1.date as date) <= cast(d.date as date) AND (a1.enddate is null or COALESCE(a1.enddate, curdate()) >= d.date) AND a1.id = t1.id)

WHERE t1.date is not null
AND t1.qcstate.publicdata = true

) s


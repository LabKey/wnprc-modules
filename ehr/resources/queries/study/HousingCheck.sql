/*
 * Copyright (c) 2011-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

PARAMETERS(MINDATE TIMESTAMP)

SELECT
h.lsid,
h2.lsid as lsid2,
h3.lsid as lsid3,
h.id,
h.room,
h.cage,
h.date,
--h2.date as previousStart,
-- h2.enddate as previousStop,
-- h4.earliest_housing,
case
  when (h2.enddate is not null) then h2.enddate
  when (h4.earliest_housing = h.date) then h4.earliest_housing
  else null
end as previous,

h.enddate,
-- h3.date as nextStart,
--h3.enddate as nextStop,
-- h4.latest_housing_end,
case
  when (h.enddate is null) then null
  when (h3.date is not null) then h3.date
  when (h4.latest_housing_end = h.enddateTimeCoalesced) then h4.latest_housing_end
  else null
end as next,
h.remark,
h.qcstate,
(select min(i.date) FROM study.housing i WHERE i.Id = h.Id and i.date > h.date) as nextHousingRecord,
(select max(i.date) FROM study.housing i WHERE i.Id = h.Id and i.date < h.date) as previousHousingRecord

FROM study.housing h

--find the previous record
left join housing h2
on (h.id = h2.id AND h.date = h2.enddate AND h2.enddate >= cast(MINDATE as date))

--find the next record
left join housing h3
on (h.id = h3.id AND h.enddateTimeCoalesced = h3.date AND h3.date >= cast(MINDATE as date))

left join (select id, count(*) as totalRecords, min(h.date) as earliest_housing, max(h.enddateTimeCoalesced) as latest_housing_end from study.housing h group by id) h4
on (h.id = h4.id)

-- left join (select id, cast(case when min(h.date) is null then null else max(h.date) end as timestamp) as latest_housing from study.housing h where enddate is not null group by id) h5
-- on (h.id = h5.id)


WHERE
--h.enddate is not null
h.id.dataset.demographics.calculated_status = 'Alive'
AND (
  (h2.id is null and h.date != h4.earliest_housing)
  or
  (h3.id is null and h.enddateTimeCoalesced != h4.latest_housing_end)
  )
and h.date >= cast(MINDATE as date)

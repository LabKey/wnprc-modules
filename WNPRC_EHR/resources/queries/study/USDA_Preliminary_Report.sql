/*
 * Copyright (c) 2011-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
PARAMETERS(StartDate TIMESTAMP, EndDate TIMESTAMP)

-- select
-- d.lsid,
-- d.id,
-- d.date,
-- d.project,
-- null as meaning,
-- null as code,
-- d.medical as remark,
-- 'SIV Infected' as category,
-- 'D' as usda_letter,
-- d.taskId,
-- from "/WNPRC/EHR".study."Demographics" d
-- where d.medical like '%siv%' or d.medical like '%shiv%'
--
--
-- UNION ALL

SELECT

  d.lsid,
  StartDate,
  EndDate,
  d.id,
  d.date as date,
  cast(d.project as varchar) as project,
  d.project.protocol as protocol,
  project.avail as avail,
  d.code.meaning as meaning,
  d.restraint,
  d.restraintDuration as restraintTime,
  d.code as code,
  -- d.restraint,
  -- d.restraintDuration as restraintTime,
  d.remark,
  coalesce(u.category, 'Flagged SNOMED Code') as category,
  coalesce(u.usda_letter, 'D') as usda_letter,
  d.taskId,
  from ehr_lookups.USDA_Codes u
  JOIN "/WNPRC/EHR".study."Drug Administration" d

  ON (d.code is not null and u.code is not null and u.code = d.code)
  WHERE (
        (u.include_previous=true AND cast(d.date as date) >= cast(StartDate as date) AND cast(d.date as date) <= cast(COALESCE(ENDDATE, curdate()) as date))
        OR (cast(d.date as date) >= cast(StartDate as date) and cast(d.date as date) <= cast(coalesce(EndDate, curdate()) as date))
        OR (u.include_previous=true AND cast (COALESCE (d.id.Demographics.death,curdate()) as date) >= StartDate AND CAST(EndDate AS DATE) >= CAST(d.date AS DATE))

        )
        and (d.project is null or d.project.avail IN( 'r', 'n', 'b', 'rr', 't'))
	AND (d.remark NOT LIKE '%catheter%' OR d.remark IS NULL )



UNION ALL

select
b.lsid,
StartDate,
EndDate,
b.id,
b.date,
cast(b.project as varchar) as project,
b.project.protocol as protocol,
project.avail as avail,
null as meaning,
null as restraint,
null as restraintTime,
null as code,
-- null as restraint,
-- null as restraintTime,
b.remark,
'Non-Clincal Biopsy' as category,
'D' as usda_letter,
b.taskId,
from "/WNPRC/EHR".study."Biopsies" b
where (b.project.avail = 'r' or b.project.avail='n')
AND (b.date >= StartDate and cast(b.date as date) <= cast(coalesce(EndDate, curdate()) as date))

UNION ALL

select
s.lsid,
StartDate,
EndDate,
s.id,
s.date,
cast(s.project as varchar) as project,
s.project.protocol as protocol,
project.avail as avail,
null as meaning,
s.restraint as restraint,
s.restraintDuration as restraintTime,
null as code,
--s.restraint as restraint,
--s.restraintDuration as restraintTime,
s.remark,
'Non-Clincal Surgery' as category,
'D' as usda_letter,
s.taskId,
from "/WNPRC/EHR".study."Clinical Encounters" s
where (s.project.avail = 'r' or s.project.avail='n')
AND (s.type like '%Surgery%' or s.type like '%surgery%')
AND (s.date >= StartDate and cast(s.date as date) <= cast(coalesce(EndDate, curdate()) as date))

UNION ALL

-- NOTE: removed since research assignments will cover these
-- select
-- b.lsid,
-- StartDate,
-- EndDate,
-- b.id,
-- b.date,
-- cast(b.project as varchar) as project,
-- b.project.protocol as protocol,
-- project.avail as avail,
-- null as meaning,
-- null as code,
-- b.remark,
-- 'Non-Clincal Blood Draw' as category,
-- 'C' as usda_letter,
-- b.taskId,
-- from "/WNPRC/EHR".study."Blood Draws" b
-- where (b.project is null or b.project.avail = 'r' or b.project.avail='n')
-- AND b.date >= StartDate and cast(b.date as date) <= cast(coalesce(EndDate, curdate()) as date)
--
-- UNION ALL


--overlapping assignments
select
null as lsid,
StartDate,
EndDate,
a.id,
max(a.date) as date,
group_concat(distinct a.project) as project,
group_concat(distinct a.project.protocol) as protocol,
group_concat(distinct a.project.avail) as avail,
null as meaning,
null as restraint,
null as restraintTime,
'Assig' as code,
null as remark,
CASE
  WHEN (group_concat(distinct a.project.avail) NOT LIKE '%r%' and group_concat(a.project.avail) not like '%n%')
    THEN 'Zero Research Assignments'
  ELSE 'One or More Research Assignments'
END as category,
CASE
  WHEN (group_concat(distinct a.project.avail) NOT LIKE '%r%' and group_concat(a.project.avail) not like '%n%')
    THEN 'B'
  WHEN (group_concat(distinct a.project.avail) LIKE '%q%' OR group_concat(distinct a.project.avail) LIKE '%t%')

     THEN 'CD'
  ELSE 'C'
END as usda_letter,

null as taskId,
from "/WNPRC/EHR".study."Assignment" a
WHERE (
(cast(COALESCE(StartDate, '1900-01-01') as date) >= a.date AND cast(COALESCE(StartDate, '1900-01-01') as date) <= cast(coalesce(a.enddate, curdate()) as date))
OR
(cast(COALESCE(EndDate, curdate()) as date) >= cast(a.date as date) AND cast(COALESCE(EndDate, curdate()) as date) <= cast(coalesce(a.enddate, now()) as date))
OR
(cast(COALESCE(StartDate, '1900-01-01') as date) <= cast(a.date as date) AND cast(COALESCE(EndDate, curdate()) as date) >= cast(coalesce(a.enddate, now()) as date))
)
group by a.id

UNION ALL

--housing records overlapping this time
select
null as lsid,
StartDate,
EndDate,
a.id,
max(a.date) as date,
null as project,
null as protocol,
null as avail,
null as meaning,
null as restraint,
null as restraintTime,
null as code,
--null as restraint,
--null as restraintTime,
null as remark,
'Housing Record' as category,
'B' as usda_letter,
null as taskId,
from "/WNPRC/EHR".study."Housing" a
WHERE (
(cast(COALESCE(STARTDATE, '1900-01-01') as date) >= cast(a.date as date) AND cast(COALESCE(STARTDATE, '1900-01-01') as date) <= cast(coalesce(a.enddate, now()) as date))
OR
(cast(COALESCE(ENDDATE, curdate()) as date) >= cast(a.date as date) AND cast(COALESCE(ENDDATE, curdate()) as date) <= cast(coalesce(a.enddate, now()) as date))
OR
(cast(COALESCE(STARTDATE, '1900-01-01') as date) <= cast(a.date as date) AND cast(COALESCE(ENDDATE, curdate()) as date) >= cast(coalesce(a.enddate, now()) as date))
)
group by a.id

UNION ALL

select
b.lsid,
StartDate,
EndDate,
b.id,
b.date,
cast(b.project as varchar) as project,
b.project.protocol as protocol,
project.avail as avail,
null as meaning,
b.restraint,
b.restraintDuration as restraintTime,
null as code,
--b.restraint,
--b.restraintDuration as restraintTime,
remark,
'Restraint' as category,
'D' as usda_letter,
taskId,
from "/WNPRC/EHR".study."Clinical Encounters" b
where taskid is not null
and b.restraint is not null
AND b.restraintDuration = '1-12 hours'
AND b.restraint.include = true
and (b.project.avail = 'r' or b.project.avail='n')
and (cast(b.date as date) >= cast(StartDate as date) and cast(b.date as date) <= cast(coalesce(EndDate, curdate()) as date))

UNION ALL

select
b.lsid,
StartDate,
EndDate,
b.id,
b.date,
cast(b.project as varchar) as project,
b.project.protocol as protocol,
project.avail as avail,
b.code.codeAndMeaning as meaning,
b.restraint,
b.restraintDuration as restraintTime,
code as code,
--b.restraint,
--b.restraintDuration as restraintTime,
remark,
CASE
  WHEN (b.project = '400901') THEN 'Anesthetics'
  ELSE 'Restraint'
END AS category,
'D' as usda_letter,
taskId,
from "/WNPRC/EHR".study."Drug Administration" b
where (taskid is not null
and b.restraint is not null
AND b.restraint.include = true
AND b.restraintDuration != '<30 min'
and (b.project.avail = 'r' or b.project.avail='n')
and (cast(b.date as date) >= cast(StartDate as date) and cast(b.date as date) <= cast(coalesce(EndDate, curdate()) as date)))
OR (cast(b.project AS VARCHAR) LIKE  '%400901%' AND (b.code LIKE '%c-60432%' OR b.code LIKE '%c-6b741%' OR b.code LIKE '%c-6a157%')
    AND (cast(b.date as date) >= cast(StartDate as date) and cast(b.date as date) <= cast(coalesce(EndDate, curdate()) as date))
    )

union all

SELECT

d.lsid,
StartDate,
EndDate,
d.id,
d.date as date,
cast(d.project as varchar) as project,
d.project.protocol as protocol,
project.avail as avail,
u.keyword as meaning,
null as restraint,
null as restraintTime,
null as code,
--null as restraint,
--null as restraintTime,
d.remark,
coalesce(u.category, 'Flagged Remark Keyword') as category,
coalesce(u.usda_letter, 'D') as usda_letter,
d.taskId,
from ehr_lookups.USDA_Codes u
JOIN "/WNPRC/EHR".study."Clinical Remarks" d

ON (d.remark is not null and u.keyword is not null and d.remark like '%'|| u.keyword || '%')
WHERE (
      (u.include_previous=true AND cast(d.date as date) <= cast(COALESCE(ENDDATE, curdate()) as date))
      OR (cast(d.date as date) >= cast(StartDate as date) and cast(d.date as date) <= cast(coalesce(EndDate, curdate()) as date))
      )
      and (d.project is null or d.project.avail = 'r' or d.project.avail='n')


union all

SELECT

d.lsid,
StartDate,
EndDate,
d.id,
d.date as date,
cast(d.project as varchar) as project,
d.project.protocol as protocol,
project.avail as avail,
u.keyword as meaning,
d.restraint,
d.restraintDuration as restraintTime,
null as code,
--d.restraint,
--d.restraintDuration as restraintTime,
d.remark,
coalesce(u.category, 'Flagged Remark Keyword') as category,
coalesce(u.usda_letter, 'D') as usda_letter,
d.taskId,
from ehr_lookups.USDA_Codes u
JOIN "/WNPRC/EHR".study."Clinical Encounters" d

ON (d.remark is not null and u.keyword is not null and d.remark like '%'|| u.keyword || '%')
WHERE (
      (u.include_previous=true AND cast(d.date as date) <= cast(COALESCE(ENDDATE, curdate()) as date))
      OR (cast(d.date as date) >= cast(StartDate as date) and cast(d.date as date) <= cast(coalesce(EndDate, curdate()) as date))
      )
      and (d.project is null or d.project.avail = 'r' or d.project.avail='n')

      UNION ALL

--housing records overlapping this time
select
null as lsid,
StartDate,
EndDate,
a.id,
--null as date,
max(a.date) as date,
null as project,
null as protocol,
null as avail,
null as meaning,
null as restraint,
cast(TIMESTAMPDIFF('SQL_TSI_HOUR', max(a.date), max(a.enddate)) AS varchar) || ' hours' as restraintTime,
null as code,
--null as restraint,
--null as restraintTime,
null as remark,
'Housing Record Chair' as category,
'D' as usda_letter,
--null as taskId,
max(a.taskId) as taskId,
from "/WNPRC/EHR".study."Housing" a
WHERE (
(cast(COALESCE(STARTDATE, '1900-01-01') as date) >= cast(a.date as date) AND cast(COALESCE(STARTDATE, '1900-01-01') as date) <= cast(coalesce(a.enddate, now()) as date))
OR
(cast(COALESCE(ENDDATE, curdate()) as date) >= cast(a.date as date) AND cast(COALESCE(ENDDATE, curdate()) as date) <= cast(coalesce(a.enddate, now()) as date))
OR
(cast(COALESCE(STARTDATE, '1900-01-01') as date) <= cast(a.date as date) AND cast(COALESCE(ENDDATE, curdate()) as date) >= cast(coalesce(a.enddate, now()) as date))
) AND (a.cage LIKE 'chair%')
AND (TIMESTAMPDIFF('SQL_TSI_HOUR', a.date, a.enddate) > 1)
--(cast(a.enddate as date) - cast(a.date as date) >  3600)
group by a.id

UNION ALL

--find all blood draws that needed meloxicam
SELECT
  null as lsid,
  StartDate,
  EndDate,
  id,
  bloodDate as date,
  bloodProject || ', '|| assignProject as project,
  bloodProtocol as protocol,
  null as avail,
  null as meaning,
  null as restraint,
  null as restraintTime,
  null as code,
  null as remark,
  'Blood Complications' as category,
  'CD' as usda_letter,
  null as taskid


  FROM (
SELECT id, bloodDate, assignProject, bloodProject, bloodProtocol FROM
(
SELECT drug.*, drug.project AS assignProject,
blood.date AS bloodDate, blood.lsid , blood.taskid, blood.project AS bloodProject, blood.protocol AS bloodProtocol
 FROM (
SELECT * FROM
(SELECT drug.*, assign.project, assign.date as StartDate, assign.enddate  as EndDate
FROM (
SELECT id ,CAST(date AS date) as date,code
FROM study.drug
WHERE CAST (date AS DATE) >= CAST(COALESCE (StartDate, '1900-01-01') AS DATE) AND
      CAST (date AS DATE) <= CAST(COALESCE (EndDate, '1900-01-01') AS DATE) AND
      (code IN ( 'c-60432' , 'w-10599' ,'c-60431'))
) drug

LEFT JOIN
(
SELECT id, CAST (date as DATE) AS date , CAST (COALESCE (assignment.enddate, curdate()) as DATE) as enddate, project
FROM study.assignment
WHERE (project.research = TRUE OR project.avail = 't')

)assign
ON
(
drug.id = assign.id
AND (
   drug.date >= assign.date
   AND
   drug.date <= assign.enddate
    )
)
)WHERE project is not null
) drug
LEFT JOIN (
  SELECT id, CAST (date as date) as Date , lsid, taskid, project, project.protocol AS protocol
  FROM study.blood

) blood
ON ( drug.id = blood.id AND drug.date  = blood.date)
) WHERE lsid is not null

)

UNION ALL

SELECT

d.lsid,
StartDate,
EndDate,
d.id,
d.death as date,
null as project,
null as protocol,
d.calculated_status as avail,
u.keyword as meaning,
null as restraint,
null as restraintTime,
null as code,
--null as restraint,
--null as restraintTime,
null as remark,
'Flagged Keyword Medical Demographics' as category,
coalesce(u.usda_letter, 'D') as usda_letter,
d.taskId,
from ehr_lookups.USDA_Codes u
JOIN "/WNPRC/EHR".study."demographics" d

ON ( u.keyword is not null and d.medical like '%'|| u.keyword || '%')
WHERE (COALESCE(d.death,curdate())>=StartDate AND d.birth <=EndDate)
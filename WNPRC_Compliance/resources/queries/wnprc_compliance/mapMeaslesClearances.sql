/*
 * Copyright (c) 2020-2026 Board of Regents of the University of Wisconsin System
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
-- noinspection SqlNoDataSourceInspectionForFile

SELECT
personid,
first_name,
middle_name,
last_name,
notes,
measlesResults.mid as id,
to_char(measlesResults.mdate, 'MM/DD/YYYY') as date,
'measles_clearances' as table_name

FROM persons

LEFT JOIN (

  SELECT
  p_m_map.person_id,
  m.id as mid,
  CAST(m.date as DATE) as mdate

  FROM measles_clearances m

  LEFT JOIN persons_measles_clearances p_m_map
  ON (
    m.id = p_m_map.clearance_id
  )

  ORDER BY mdate DESC

) measlesResults

ON measlesResults.person_id = persons.personid

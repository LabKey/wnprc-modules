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
hold,
measles_required,
tbResults.tbid as id,
to_char(tbResults.tbdate,'MM/DD/YYYY') as date,
'tb_clearances' as table_name

FROM persons

LEFT JOIN (

  SELECT
  p_tb_map.person_id,
  tb.id as tbid,
  CAST(tb.date as DATE) as tbdate

  FROM tb_clearances tb

  LEFT JOIN persons_tb_clearances p_tb_map
  ON (
    tb.id = p_tb_map.clearance_id
  )

  ORDER BY tbdate DESC

) tbResults

ON tbResults.person_id = persons.personid




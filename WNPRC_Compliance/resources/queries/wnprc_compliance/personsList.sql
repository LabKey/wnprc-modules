/*
 * Copyright (c) 2017-2026 Board of Regents of the University of Wisconsin System
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
SELECT
DISTINCT(persons.personid),
last_name,
first_name,
middle_name,
date_of_birth,
notes,
tbResults.lastClearance as lastTbClearance,
measlesResults.lastClearance as measlesClearance,
measles_required,
hold,
archived_for_access_purposes as isArchived

FROM persons

LEFT JOIN (

  SELECT
  p_tb_map.person_id,
  MAX(tb.date) as lastClearance

  FROM tb_clearances tb

  LEFT JOIN persons_tb_clearances p_tb_map
  ON (
    tb.id = p_tb_map.clearance_id
  )

  GROUP BY (p_tb_map.person_id)
) tbResults

ON tbResults.person_id = persons.personid


LEFT JOIN (

  SELECT
  p_m_map.person_id,
  MAX(m.date) as lastClearance

  FROM measles_clearances m

  LEFT JOIN persons_measles_clearances p_m_map
  ON (
    m.id = p_m_map.clearance_id
  )

  GROUP BY p_m_map.person_id
) measlesResults

ON measlesResults.person_id = persons.personid


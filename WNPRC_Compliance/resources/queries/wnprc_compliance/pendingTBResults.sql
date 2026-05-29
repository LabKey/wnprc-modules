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
pending_with_personid.*,
persons.first_name,
persons.middle_name,
persons.last_name,

FROM (
  SELECT
  pending.*,
  person_lookup.person_id

  FROM (
    SELECT
    id,
    date,
    comment

    FROM wnprc_compliance.pending_tb_clearances p
    WHERE NOT (
      p.tbclearance_id IS NOT NULL
      OR
      p.archived IS TRUE
    )
  ) pending

  LEFT JOIN wnprc_compliance.persons_pending_tb_clearances person_lookup
  ON (
    person_lookup.clearance_id = pending.id
  )
) pending_with_personid

LEFT JOIN wnprc_compliance.persons persons
ON (
  pending_with_personid.person_id = persons.personid
)


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
SELECT x.*
FROM (SELECT
        b.dam  dam,
        b.date date,
        CASE
        WHEN b.conception IS NULL
          THEN timestampadd('SQL_TSI_DAY', -165, b.date)
        ELSE b.conception
        END    conception,
        'pg'   medical,
        b.sire sire
      FROM study.birth b
      UNION
      SELECT
        p.dam  dam,
        p.date date,
        CASE
        WHEN p.conception IS NULL
          THEN timestampadd('SQL_TSI_DAY', -165, p.date)
        ELSE p.conception
        END    conception,
        'pg'   medical,
        p.sire sire
      FROM study.prenatal p
      UNION
      SELECT
        d.id      dam,
        curdate() date,
        NULL      conception,
        d.medical medical,
        NULL      sire
      FROM study.demographics d
      WHERE lower(medical) LIKE '%pg%'
            AND calculated_status = 'Alive'
     ) x
WHERE x.dam IS NOT NULL
      AND x.dam <> 'unknown'
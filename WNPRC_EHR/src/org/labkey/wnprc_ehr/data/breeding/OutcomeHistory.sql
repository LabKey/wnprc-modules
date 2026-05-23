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
SELECT
  y.*,
  pg.lsid pregnancyid
FROM (SELECT
        b.dam    dam,
        b.date   date,
        b.id     infantid,
        'birth'  outcome,
        NULL     project,
        b.remark remark
      FROM study.birth b
      UNION
      SELECT
        p.dam      dam,
        p.date     date,
        p.id       infantid,
        'prenatal' outcome,
        p.project  project,
        p.remark   remark
      FROM study.prenatal p
     ) y
  INNER JOIN study.pregnancies pg
    ON y.dam = pg.id
       AND y.date = pg.date
WHERE y.dam IS NOT NULL
      AND y.dam <> 'unknown'
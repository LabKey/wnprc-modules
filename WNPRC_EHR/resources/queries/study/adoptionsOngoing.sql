/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

SELECT
  a.Id,
  a.date,
  a.type,
  a.result,
  a.dam
FROM study.adoptions a
WHERE (a.type = '0') -- start
  AND NOT EXISTS (
    SELECT 1
    FROM study.adoptions a2
    WHERE a.Id = a2.Id
      AND a2.date > a.date
      AND (a2.type = '1') -- end
  )

/*
 * Copyright (c) 2022-2026 Board of Regents of the University of Wisconsin System
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
--used to find rows that do not exist in arrow connection but not in ehr protocol, for deletion in ETL
SELECT protocol as protocol_id,
        NOW() as date_modified
FROM ehr.protocol a
WHERE NOT EXISTS
    (SELECT w.protocol_id as protocol
     FROM wnprc.MaxSpeciesDistinct w
     WHERE lower(w.protocol_id) = lower(a.protocol))
AND a.protocol != 'wprc00';
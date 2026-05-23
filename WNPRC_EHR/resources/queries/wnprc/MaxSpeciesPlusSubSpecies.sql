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
SELECT rowid,
       arrow_common_name AS species,
       protocol_id       AS protocol,
       max_three_year    AS allowed,
       date_modified,
       date_expiration
FROM (
         (
             SELECT rowid, arrow_common_name, protocol_id, max_three_year, date_modified, date_expiration
             FROM arrow_protocols

             UNION ALL

             SELECT rowid, 'Rhesus' AS arrow_common_name, protocol_id, max_three_year, date_modified, date_expiration
             FROM arrow_protocols
             WHERE arrow_common_name = 'Macaque'

             UNION ALL

             SELECT rowid, 'Cynomolgus' AS arrow_common_name, protocol_id, max_three_year, date_modified, date_expiration
             FROM arrow_protocols
             WHERE arrow_common_name = 'Macaque'

             UNION ALL

             SELECT rowid, 'Pigtail' AS arrow_common_name, protocol_id, max_three_year, date_modified, date_expiration
             FROM arrow_protocols
             WHERE arrow_common_name = 'Macaque'
         )

         UNION ALL
         SELECT rowid, arrow_common_name, protocol_id, max_three_year, modified as date_modified, date_expiration
         FROM extra_protocols

     )
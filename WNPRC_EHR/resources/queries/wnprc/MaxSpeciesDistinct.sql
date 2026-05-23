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
SELECT DISTINCT b.protocol_id,
                b.protocol_title,
                b.pi_name,
                b.date_approved,
                b.date_expiration,
                b.date_modified,
                a.sum_three_yr,
                b.usda_code,
                (SELECT contacts FROM ehr.protocol e WHERE lower(b.protocol_id) = lower(e.protocol)) AS contacts
FROM arrow_protocols b
         INNER JOIN (
    SELECT protocol_id,
           sum(max_three_year) AS sum_three_yr
    FROM arrow_protocols
    GROUP BY protocol_id
) a ON a.protocol_id = b.protocol_id

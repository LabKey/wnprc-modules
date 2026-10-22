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
    r.room,
    r.objectid as rack_object_id,
    r.rackid,
    c.objectid as cage_object_id,
    c.cage_number
FROM
    cageui.racks r
        JOIN
    ehr_lookups.rooms rm ON r.room = rm.room
        LEFT JOIN
    cageui.cages c ON r.objectid = c.rack
ORDER BY
    r.room, r.rackid, c.cage_number;

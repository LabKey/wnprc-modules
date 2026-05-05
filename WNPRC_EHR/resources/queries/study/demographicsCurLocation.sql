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

    d2.id,

    CASE
        WHEN d2.cage is null then d2.room
        ELSE (d2.room || '-' || d2.cage)
        END AS Location,

    d2.room.area,

    d2.room,

    d2.cageOld,

    d2.cage,

    ifdefined(d2.cond) as cond,

    d2.date,

    d2.reason,

    d2.remark,

    coalesce(d2.room, '') as room_order,
    d2.room_sortValue @hidden,

    coalesce(d2.cage, '') as cage_order,
    d2.cage_sortValue @hidden

FROM study.housing d2

WHERE d2.enddate IS NULL
  AND d2.qcstate.publicdata = true
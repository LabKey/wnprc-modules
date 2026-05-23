/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
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
fd.id,
fd.date,
fd.schedule,
fd.depriveStartTime,
fd.restoredTime,
TRUNCATE(CAST(timestampdiff(SQL_TSI_HOUR,fd.depriveStartTime,coalesce(fd.restoredTime,now())) AS NUMERIC),2)  AS hoursSinceStarted,
fd.id.curLocation.room AS room,
fd.id.curLocation.cage AS cage,
fd.assignedTo,
fd.protocolContact,
fd.reason,
fd.qcstate

FROM study.foodDeprives fd
WHERE
fd.id.dataset.demographics.calculated_status = 'Alive' AND
fd.qcstate.label != 'Scheduled'
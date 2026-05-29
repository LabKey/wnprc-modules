/*
 * Copyright (c) 2024-2026 Board of Regents of the University of Wisconsin System
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
SELECT b.Id,
       b.date,
       b.tube_type,
       b.tube_vol,
       b.quantity,
       b.performedby,
       b.requestor,
       b.project,
       b.assayCode,
       b.billedby,
       b.num_tubes,
       b.remark,
       b.additionalServices,
       b.account,
       b.daterequested,
       b.restraint,
       b.restraintTime,
       b.instructions,
       b.restraintDuration,
       b.BloodRemaining.AvailBlood,
       b.QCState,
       b.QCState.label
FROM "Blood Draws" b
LEFT JOIN ehr_lookups.species e ON e.common = b.Id.Demographics.species
WHERE b.BloodRemaining.AvailBlood < e.blood_threshold_warning AND  b.date > curdate() AND b.date < cast(TIMESTAMPADD('SQL_TSI_DAY', 1, curdate()) as date) AND b.QCState.label <> 'Request: Denied'
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
PARAMETERS ( PARENT_RECORD_ID VARCHAR )
SELECT
  u.date,
  u.project,
  u.restraint,
  u.fetal_heartbeat,
  u.beats_per_minute,
  u.gest_sac_mm,
  u.gest_sac_gest_day,
  u.crown_rump_mm,
  u.crown_rump_gest_day,
  u.biparietal_diameter_mm,
  u.biparietal_diameter_gest_day,
  u.femur_length_mm,
  u.femur_length_gest_day,
  u.yolk_sac_diameter_mm,
  u.head_circumference_mm,
  u.code,
  u.remark,
  u.performedby,
  u.followup_required
FROM ultrasounds u
WHERE u.pregnancyid = (SELECT p.lsid
                       FROM pregnancies p
                       WHERE p.objectid = PARENT_RECORD_ID
                       LIMIT 1)
ORDER BY u.date DESC
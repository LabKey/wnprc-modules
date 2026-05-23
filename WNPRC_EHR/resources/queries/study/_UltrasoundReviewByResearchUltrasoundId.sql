/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
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
  ur.date,
  ur.head,
  ur.falx,
  ur.thalamus,
  ur.lateral_ventricles,
  ur.choroid_plexus,
  ur.eye,
  ur.profile,
  ur.four_chamber_heart,
  ur.diaphragm,
  ur.stomach,
  ur.bowel,
  ur.bladder,
  ur.findings,
  ur.placenta_notes,
  ur.remarks,
  ur.completed
FROM ultrasound_review ur
WHERE ur.ultrasound_id = PARENT_RECORD_ID
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
PARAMETERS
(START_DATE TIMESTAMP, END_DATE TIMESTAMP)

SELECT o.id
     , o.housingattime.roomattime
     , o.housingattime.cageattime
     --, o.id.curlocation.cage
     , o.date
     , o.behavior
     , o.otherbehavior
FROM study.obs o
WHERE o.date <= END_DATE AND o.date >= START_DATE
AND (o.behavior IS NOT NULL OR o.otherbehavior IS NOT NULL)
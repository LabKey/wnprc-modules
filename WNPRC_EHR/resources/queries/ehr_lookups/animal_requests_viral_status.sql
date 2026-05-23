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
SELECT viral_status.rowid,
viral_status.value,
viral_status.title,
viral_status.category,
viral_status.description,
viral_status.sort_order,
viral_status.date_disabled
FROM ehr_lookups.viral_status
WHERE viral_status.value IN ('SPF4', 'SPF5 (AAV-)', 'SPF5 (RRV-)', 'SPF6 (-AAV & -RRV)', 'Conventional', 'Conventional and SPF4', 'Any')
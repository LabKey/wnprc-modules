/*
 * Copyright (c) 2023-2026 Board of Regents of the University of Wisconsin System
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
    assays_llod.rowid,
    assays_llod.assay_name,
    assays_llod.start_date,
    CASE WHEN (assays_llod.end_date is null) THEN now()
    ELSE assays_llod.end_date
    END as end_date,
    assays_llod.llod,
    assays_llod.container,
    assays_llod.createdby,
    assays_llod.created,
    assays_llod.modifiedby,
    assays_llod.modified
FROM wnprc_virology.assays_llod

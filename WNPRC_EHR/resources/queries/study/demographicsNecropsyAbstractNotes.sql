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
/* concatenate remarks and projects from the NecropsyAbstract dataset */
SELECT
    a.id as id,
    group_concat ( (a.remark || ' (' || coalesce(cast(a.project as varchar), 'no proj.') || ')' ), '; ') as remark
FROM study.NecropsyAbstract a
GROUP BY a.id
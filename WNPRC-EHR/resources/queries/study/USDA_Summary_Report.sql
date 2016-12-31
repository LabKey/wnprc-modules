/*
 * Copyright (c) 2011 LabKey Corporation
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
u.id,
max(u.lsid) as lsid,
group_concat(distinct protocol) as protocols,
group_concat(distinct u.category) as categories,
group_concat(distinct u.usda_letter) as usda_letters,
max(u.usda_letter) as max_usda_letter,
count(*) as totalRecords,
cast(max(u.StartDate) as date) as StartDate,
cast(max(u.EndDate) as date) as EndDate,

FROM study.USDA_Preliminary_Report u

group by u.id
having group_concat(distinct u.category) like '%Housing%'
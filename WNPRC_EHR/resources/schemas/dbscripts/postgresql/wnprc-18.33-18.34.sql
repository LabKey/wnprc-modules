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
insert into ehr.form_framework_types (schemaname,queryname,framework,container) select 'study', 'feeding', 'reactjs', entityid from core.containers WHERE name='EHR' LIMIT 1;

insert into ehr_lookups.lookup_sets (setname,container)  select 'feeding_types' as setname, container from ehr_lookups.lookup_sets where setname='viral_status' LIMIT 1;
insert into ehr_lookups.lookups (set_name,container,value) select setname, container, 'log' as value from ehr_lookups.lookup_sets where setname='feeding_types';
insert into ehr_lookups.lookups (set_name,container,value) select setname, container, 'log (gluten-free)' as value from ehr_lookups.lookup_sets where setname='feeding_types';
insert into ehr_lookups.lookups (set_name,container,value) select setname, container, 'flower' as value from ehr_lookups.lookup_sets where setname='feeding_types';

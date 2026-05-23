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
alter table wnprc.animal_requests add column executivecommitteeapproval varchar(100);
alter table wnprc.animal_requests add column anticipatedstartdate TIMESTAMP;
alter table wnprc.animal_requests add column anticipatedenddate TIMESTAMP;
alter table wnprc.animal_requests add column pregnantanimalsrequired varchar(100);
alter table wnprc.animal_requests add column animalidstooffer TEXT;

insert into ehr_lookups.lookup_sets (setname,container)  select 'animal_requests_yes_no' as setname, container from ehr_lookups.lookup_sets where setname='animal_requests_sex';
insert into ehr_lookups.lookups (set_name,container,value) select setname, container, 'Yes' as value from ehr_lookups.lookup_sets where setname='animal_requests_yes_no';
insert into ehr_lookups.lookups (set_name,container,value) select setname, container, 'No' as value from ehr_lookups.lookup_sets where setname='animal_requests_yes_no';

insert into ehr_lookups.lookups (set_name,container,value) select setname, container, 'SPF6 (-AAV & -RRV)' as value from ehr_lookups.lookup_sets where setname='viral_status';

alter table wnprc.animal_requests rename column project to optionalproject;
alter table wnprc.animal_requests add column project integer;
insert into ehr_lookups.lookups (set_name,container,value) select setname, container, 'Conventional and SPF4' as value from ehr_lookups.lookup_sets where setname='viral_status';

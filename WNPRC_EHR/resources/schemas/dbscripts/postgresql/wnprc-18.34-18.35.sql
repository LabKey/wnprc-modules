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

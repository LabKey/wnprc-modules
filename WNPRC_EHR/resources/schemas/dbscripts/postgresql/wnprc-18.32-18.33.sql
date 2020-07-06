insert into ehr.form_framework_types (schemaname,queryname,framework,container) select 'study', 'feeding', 'reactjs', entityid from core.containers WHERE name='EHR' LIMIT 1;

insert into ehr_lookups.lookup_sets (setname,container)  select 'feeding_types' as setname, container from ehr_lookups.lookup_sets where setname='viral_status' LIMIT 1;
insert into ehr_lookups.lookups (set_name,container,value) select setname, container, 'log' as value from ehr_lookups.lookup_sets where setname='feeding_types';
insert into ehr_lookups.lookups (set_name,container,value) select setname, container, 'log (gluten-free)' as value from ehr_lookups.lookup_sets where setname='feeding_types';
insert into ehr_lookups.lookups (set_name,container,value) select setname, container, 'flower' as value from ehr_lookups.lookup_sets where setname='feeding_types';

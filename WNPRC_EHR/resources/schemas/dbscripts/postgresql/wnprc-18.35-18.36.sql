insert into ehr_lookups.lookup_sets (setname,container)  select 'ancestry' as setname, container from ehr_lookups.lookup_sets where setname='viral_status';


insert into ehr_lookups.lookups (set_name,container,value) select setname, container, 'Planned death as a result of experimental procedure' as value from ehr_lookups.lookup_sets where setname='death_manner';
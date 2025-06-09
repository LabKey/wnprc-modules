DROP TABLE IF EXISTS cageui.cage_modifications;
CREATE TABLE cageui.cage_modifications
(
    rowid SERIAL NOT NULL,
    room VARCHAR(50) NOT NULL,
    rack INTEGER,
    cage INTEGER,
    modification varchar,
    locationid INTEGER,
    location INTEGER,
    subsectionid INTEGER,
    startDate TIMESTAMP NOT NULL,
    endDate TIMESTAMP,
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,
    CONSTRAINT PK_cage_modifications PRIMARY KEY (rowid),
    CONSTRAINT FK_cage_modifications_container FOREIGN KEY (container) REFERENCES core.Containers (EntityId)
);
/*
 Regarding categories:
 Vertical is when the mod is applicable to a cage with a cage beneath it, and vice versa
 Horizontal is like vertical but in the horizontal direction for cages next to each other
 Direct is when the mod is only applicable to the cage it is attached to.
 */
INSERT INTO ehr_lookups.lookup_sets (setname, label, description, keyField, container)
select 'cageui_modifications' as setname,
       'Rack/Cage Modification Field Values' as label,
       'List of rack/cage modifications' as description,
       'value' as keyField,
       container from ehr_lookups.lookup_sets where setname='ancestry';

insert into ehr_lookups.lookups (set_name,container,value, category, title )
select setname, container, 'sf' as value, 'vertical' as category, 'Standard Floor' as title from ehr_lookups.lookup_sets where setname='cageui_modifications';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 'mf' as value, 'vertical' as category, 'Mesh Floor' as title from ehr_lookups.lookup_sets where setname='cageui_modifications';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 'dmf' as value, 'vertical' as category, 'Double Mesh Floor' as title from ehr_lookups.lookup_sets where setname='cageui_modifications';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 'nf' as value, 'vertical' as category, 'No Floor' as title from ehr_lookups.lookup_sets where setname='cageui_modifications';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 'sd' as value, 'horizontal' as category, 'Solid Divider' as title from ehr_lookups.lookup_sets where setname='cageui_modifications';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 'pcd' as value, 'horizontal' as category, 'Protected Contact Divider' as title from ehr_lookups.lookup_sets where setname='cageui_modifications';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 'vcd' as value, 'horizontal' as category, 'Visual Contact Divider' as title from ehr_lookups.lookup_sets where setname='cageui_modifications';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 'pd' as value, 'horizontal' as category, 'Privacy Divider' as title from ehr_lookups.lookup_sets where setname='cageui_modifications';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 'nd' as value, 'horizontal' as category, 'No Divider' as title from ehr_lookups.lookup_sets where setname='cageui_modifications';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 'ct' as value, 'vertical' as category, 'C-Tunnel' as title from ehr_lookups.lookup_sets where setname='cageui_modifications';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 'ex' as value, 'direct' as category, 'Extension' as title from ehr_lookups.lookup_sets where setname='cageui_modifications';


INSERT INTO ehr_lookups.lookup_sets (setname, label, description, keyField, container)
select 'cageui_modification_locations' as setname,
       'Modification Location Field Values' as label,
       'Locations that a mod can be placed at' as description,
       'value' as keyField,
       container from ehr_lookups.lookup_sets where setname='ancestry';


insert into ehr_lookups.lookups (set_name,container,value,category,title)
select setname, container, 0 as value,'horizontal' as category, 'Left' as title from ehr_lookups.lookup_sets where setname='cageui_modification_locations';

insert into ehr_lookups.lookups (set_name,container,value,category,title)
select setname, container, 1 as value,'horizontal' as category, 'Right' as title from ehr_lookups.lookup_sets where setname='cageui_modification_locations';

insert into ehr_lookups.lookups (set_name,container,value,category,title)
select setname, container, 2 as value,'vertical' as category, 'Top' as title from ehr_lookups.lookup_sets where setname='cageui_modification_locations';

insert into ehr_lookups.lookups (set_name,container,value,category,title)
select setname, container, 3 as value,'vertical' as category, 'Bottom' as title from ehr_lookups.lookup_sets where setname='cageui_modification_locations';

insert into ehr_lookups.lookups (set_name,container,value,category,title)
select setname, container, 4 as value,'direct' as category, 'Direct' as title from ehr_lookups.lookup_sets where setname='cageui_modification_locations';

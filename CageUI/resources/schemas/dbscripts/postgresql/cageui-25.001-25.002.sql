DROP TABLE IF EXISTS cageui.cage_modifications_history;
CREATE TABLE cageui.cage_modifications_history
(
    rowid SERIAL NOT NULL,
    modId varchar NOT NULL,
    room VARCHAR(50) NOT NULL,
    rack INTEGER,
    cage INTEGER,
    modification varchar,
    subId INTEGER,
    location INTEGER,
    startDate TIMESTAMP NOT NULL,
    endDate TIMESTAMP,
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,
    CONSTRAINT PK_cage_modifications_history PRIMARY KEY (rowid),
    CONSTRAINT FK_cage_modifications_history_container FOREIGN KEY (container) REFERENCES core.Containers (EntityId)
);

DROP TABLE IF EXISTS cageui.cage_modifications;
CREATE TABLE cageui.cage_modifications
(
    rowid SERIAL NOT NULL,
    value VARCHAR(10) NOT NULL,
    title VARCHAR(50) NOT NULL,
    direction INTEGER NOT NULL, -- determines what kind of mod it is
    type INTEGER NOT NULL, -- determines what type of mod is located at the direction
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,
    CONSTRAINT PK_cage_modifications PRIMARY KEY (rowid),
    CONSTRAINT FK_cage_modifications_container FOREIGN KEY (container) REFERENCES core.Containers (EntityId)
);



/*
Example on difference between direction and position.

C-tunnel: Vertical direction with an attachment position
Extension: Direct direction with an attachment position.

Extensions are (attached) (directly) on the cage, c-tunnels are (attached) on the cages (vertically) between two cages.
When deciding where to show the mod as an option it uses direction.
When deciding if mod configurations are valid (two mods not blocking each other) it uses position.
*/
INSERT INTO ehr_lookups.lookup_sets (setname, label, description, keyField, container)
select 'cageui_modification_directions' as setname,
       'Modification Direction Field Values' as label,
       'Direction determines what kind of mod can be placed where' as description,
       'value' as keyField,
       container from ehr_lookups.lookup_sets where setname='ancestry';

insert into ehr_lookups.lookups (set_name,container,value,title)
select setname, container, 0 as value, 'Horizontal' as title from ehr_lookups.lookup_sets where setname='cageui_modification_directions';

insert into ehr_lookups.lookups (set_name,container,value,title)
select setname, container, 1 as value, 'Vertical' as title from ehr_lookups.lookup_sets where setname='cageui_modification_directions';

insert into ehr_lookups.lookups (set_name,container,value,title)
select setname, container, 2 as value, 'Direct' as title from ehr_lookups.lookup_sets where setname='cageui_modification_directions';


INSERT INTO ehr_lookups.lookup_sets (setname, label, description, keyField, container)
select 'cageui_modification_types' as setname,
       'Modification Type Field Values' as label,
       'Types of positions that determines if mods of different directions occupy the same IRL location' as description,
       'value' as keyField,
       container from ehr_lookups.lookup_sets where setname='ancestry';


insert into ehr_lookups.lookups (set_name,container,value,title)
select setname, container, 0 as value,'Attachment' as title from ehr_lookups.lookup_sets where setname='cageui_modification_types';

insert into ehr_lookups.lookups (set_name,container,value,title)
select setname, container, 1 as value,'Separator' as title from ehr_lookups.lookup_sets where setname='cageui_modification_types';


INSERT INTO ehr_lookups.lookup_sets (setname, label, description, keyField, container)
select 'cageui_modification_locations' as setname,
       'Modification Location Field Values' as label,
       'Lists the sides/places a modification can exist' as description,
       'value' as keyField,
       container from ehr_lookups.lookup_sets where setname='ancestry';

insert into ehr_lookups.lookups (set_name,container,value,title)
select setname, container, 0 as value, 'Left' as title from ehr_lookups.lookup_sets where setname='cageui_modification_locations';

insert into ehr_lookups.lookups (set_name,container,value,title)
select setname, container, 1 as value, 'Right' as title from ehr_lookups.lookup_sets where setname='cageui_modification_locations';

insert into ehr_lookups.lookups (set_name,container,value,title)
select setname, container, 2 as value, 'Top' as title from ehr_lookups.lookup_sets where setname='cageui_modification_locations';

insert into ehr_lookups.lookups (set_name,container,value,title)
select setname, container, 3 as value, 'Bottom' as title from ehr_lookups.lookup_sets where setname='cageui_modification_locations';

insert into ehr_lookups.lookups (set_name,container,value,title)
select setname, container, 4 as value, 'Direct' as title from ehr_lookups.lookup_sets where setname='cageui_modification_locations';
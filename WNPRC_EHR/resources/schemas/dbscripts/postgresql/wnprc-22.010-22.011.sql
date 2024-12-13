--TODO Tables for CageUI, change before actual commit to snapshot to reflect correct version

-- Table for storing layout history data, either room object or (rack_group, rack, cage) must exist
-- If rack = 0 than default_rack must not be null
-- If end_date is null, that is the current layout for the room
DROP TABLE IF EXISTS wnprc.layout_history;
CREATE TABLE wnprc.layout_history
(
    rowid SERIAL NOT NULL,
    room VARCHAR(50) NOT NULL,
    room_object VARCHAR(50),
    rack_group INTEGER,
    rack INTEGER,
    cage VARCHAR(50),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    x_coord INTEGER NOT NULL,
    y_coord INTEGER NOT NULL,
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,
    CONSTRAINT PK_layout_history PRIMARY KEY (rowid),
    CONSTRAINT FK_layout_history_container FOREIGN KEY (container) REFERENCES core.Containers (EntityId),
    CONSTRAINT CHECK_layout_history_not_null CHECK (
        (room_object IS NOT NULL) OR
        (rack_group IS NOT NULL AND rack IS NOT NULL AND cage IS NOT NULL)
    )
);

INSERT INTO ehr_lookups.lookup_sets (setname, label, description, keyField, container)
select 'cageui_item_types' as setname,
       'Room Item Type Field Values' as label,
       'List of items that can be placed into the cageUI layout editor' as description,
       'value' as keyField,
       container from ehr_lookups.lookup_sets where setname='ancestry';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 'cage' as value, 'Caging' as category, 'Cage' as Title from ehr_lookups.lookup_sets where setname='cageui_item_types';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 'pen' as value, 'Caging' as category, 'Pen' as Title from ehr_lookups.lookup_sets where setname='cageui_item_types';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 'tempCage' as value, 'Caging' as category, 'Temp Cage' as Title from ehr_lookups.lookup_sets where setname='cageui_item_types';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 'playCage' as value, 'Caging' as category, 'Play Cage' as Title from ehr_lookups.lookup_sets where setname='cageui_item_types';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 'door' as value, 'Room Object' as category, 'Door' as Title from ehr_lookups.lookup_sets where setname='cageui_item_types';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 'drain' as value, 'Room Object' as category, 'Drain' as Title from ehr_lookups.lookup_sets where setname='cageui_item_types';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 'roomDivider' as value, 'Room Object' as category, 'Room Divider' as Title from ehr_lookups.lookup_sets where setname='cageui_item_types';

INSERT INTO ehr_lookups.lookup_sets (setname, label, description, keyField, container)
select 'cageui_rack_manufacturers' as setname,
       'Rack Manufacturer Field Values' as label,
       'List of rack manufacturers' as description,
       'value' as keyField,
       container from ehr_lookups.lookup_sets where setname='ancestry';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 'at' as value, 'Allentown' as title from ehr_lookups.lookup_sets where setname='cageui_rack_manufacturers';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 'sb' as value, 'Suburban' as title from ehr_lookups.lookup_sets where setname='cageui_rack_manufacturers';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 'lk' as value, 'Lenderking' as title from ehr_lookups.lookup_sets where setname='cageui_rack_manufacturers';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 'wnprc' as value, 'WNPRC' as title from ehr_lookups.lookup_sets where setname='cageui_rack_manufacturers';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 'uk' as value, 'Unknown' as title from ehr_lookups.lookup_sets where setname='cageui_rack_manufacturers';
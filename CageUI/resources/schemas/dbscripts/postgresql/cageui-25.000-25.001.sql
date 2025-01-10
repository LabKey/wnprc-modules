/*
 * Copyright (c) 2025 LabKey Corporation
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

-- Create schema, tables, indexes, and constraints used for CageUI module here
-- All SQL VIEW definitions should be created in cageui-create.sql and dropped in cageui-drop.sql
DROP SCHEMA IF EXISTS cageui;

CREATE SCHEMA cageui;

--TODO Tables for CageUI, change before actual commit to snapshot to reflect correct version

-- Table for storing layout history data, either room object or (rack_group, rack, cage) must exist
-- If rack = 0 than default_rack must not be null
-- If end_date is null, that is the current layout for the room
DROP TABLE IF EXISTS cageui.layout_history;
CREATE TABLE cageui.layout_history
(
    rowid SERIAL NOT NULL,
    room VARCHAR(50) NOT NULL,
    object_type INTEGER,
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
    CONSTRAINT FK_layout_history_container FOREIGN KEY (container) REFERENCES core.Containers (EntityId)
);

INSERT INTO ehr_lookups.lookup_sets (setname, label, description, keyField, container)
select 'cageui_item_types' as setname,
       'Room Item Type Field Values' as label,
       'List of items that can be placed into the cageUI layout editor' as description,
       'value' as keyField,
       container from ehr_lookups.lookup_sets where setname='ancestry';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 0 as value, 'Caging' as category, 'Default Cage' as title from ehr_lookups.lookup_sets where setname='cageui_item_types';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 1 as value, 'Caging' as category, 'Default Pen' as title from ehr_lookups.lookup_sets where setname='cageui_item_types';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 2 as value, 'Caging' as category, 'Default Temp Cage' as title from ehr_lookups.lookup_sets where setname='cageui_item_types';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 3 as value, 'Caging' as category, 'Default Play Cage' as title from ehr_lookups.lookup_sets where setname='cageui_item_types';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 4 as value, 'Caging' as category, 'Cage' as title from ehr_lookups.lookup_sets where setname='cageui_item_types';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 5 as value, 'Caging' as category, 'Pen' as title from ehr_lookups.lookup_sets where setname='cageui_item_types';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 6 as value, 'Caging' as category, 'Temp Cage' as title from ehr_lookups.lookup_sets where setname='cageui_item_types';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 7 as value, 'Caging' as category, 'Play Cage' as title from ehr_lookups.lookup_sets where setname='cageui_item_types';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 100 as value, 'Room Object' as category, 'Room Divider' as title from ehr_lookups.lookup_sets where setname='cageui_item_types';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 101 as value, 'Room Object' as category, 'Drain' as title from ehr_lookups.lookup_sets where setname='cageui_item_types';

insert into ehr_lookups.lookups (set_name,container,value, category, title)
select setname, container, 102 as value, 'Room Object' as category, 'Door' as title from ehr_lookups.lookup_sets where setname='cageui_item_types';

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

-- TODO consider moving this table to ehr_lookups with labkey help
DROP TABLE IF EXISTS cageui.racks;
CREATE TABLE cageui.racks
(
    rowid SERIAL NOT NULL,
    rackid INTEGER NOT NULL,
    rack_type varchar(50) NOT NULL,
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,
    CONSTRAINT PK_racks PRIMARY KEY (rowid),
    CONSTRAINT FK_racks_container FOREIGN KEY (container) REFERENCES core.Containers (EntityId)
);
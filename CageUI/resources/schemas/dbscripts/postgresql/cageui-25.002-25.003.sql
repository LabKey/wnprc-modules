/*
 *
 *  * Copyright (c) 2025 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */


/*
 List of all the racks at the center (for WNPRC cages are NOT removable from racks)
 */
DROP TABLE IF EXISTS cageui.racks;
CREATE TABLE cageui.racks
(
    rowid SERIAL NOT NULL,
    objectid VARCHAR NOT NULL,
    room VARCHAR,
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

-- Table for storing layout history data, either room object or (rack_group, rack, cage) must exist
-- If end_date is null, that is the current layout for the room
DROP TABLE IF EXISTS cageui.layout_history;
CREATE TABLE cageui.layout_history
(
    rowid SERIAL NOT NULL,
    historyid VARCHAR NOT NULL,
    cage_historyid VARCHAR,
    object_type INTEGER,
    extra_context VARCHAR,
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

/*
 This table manages all histories for each room and template room
 */
DROP TABLE IF EXISTS cageui.all_history;
CREATE TABLE cageui.all_history
(
    rowid SERIAL NOT NULL,
    room VARCHAR NOT NULL,
    history_type VARCHAR(20) NOT NULL CHECK (history_type IN ('template', 'real')),
    valid BOOLEAN NOT NULL,
    start_date DATE NOT NULL,
    end_date Date,
    room_historyid VARCHAR NOT NULL,
    real_historyid VARCHAR,
    template_historyid VARCHAR,
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,
    CONSTRAINT single_layout CHECK (
        (history_type = 'template' AND template_historyid IS NOT NULL AND real_historyid IS NULL) OR
        (history_type = 'real' AND real_historyid IS NOT NULL AND template_historyid IS NULL)
        ),
    CONSTRAINT PK_all_history PRIMARY KEY (rowid),
    CONSTRAINT FK_all_history_container FOREIGN KEY (container) REFERENCES core.Containers (EntityId)

);


/*
 This table manages room layout status and layout scale and border information
 */
DROP TABLE IF EXISTS cageui.room_history;
CREATE TABLE cageui.room_history
(
    rowid SERIAL NOT NULL,
    historyid VARCHAR NOT NULL,
    scale INTEGER,
    border_width INTEGER,
    border_height INTEGER,
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,
    CONSTRAINT PK_room_history PRIMARY KEY (rowid),
    CONSTRAINT FK_room_history_container FOREIGN KEY (container) REFERENCES core.Containers (EntityId)
);

/*
 This table is for room defaults/template histories
 */
DROP TABLE IF EXISTS cageui.template_layout_history;
CREATE TABLE cageui.template_layout_history
(
    rowid SERIAL NOT NULL,
    historyid VARCHAR NOT NULL,
    rack_group INTEGER,
    rack INTEGER,
    cage INTEGER,
    object_type INTEGER,
    extra_context VARCHAR,
    x_coord INTEGER NOT NULL,
    y_coord INTEGER NOT NULL,
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,
    CONSTRAINT PK_template_layout_history PRIMARY KEY (rowid),
    CONSTRAINT FK_template_layout_history_container FOREIGN KEY (container) REFERENCES core.Containers (EntityId)
);

DROP TABLE IF EXISTS cageui.cages;
CREATE TABLE cageui.cages
(
    rowid SERIAL NOT NULL,
    objectid VARCHAR NOT NULL,
    rack VARCHAR NOT NULL,
    cage_number INTEGER NOT NULL,
    length INTEGER,
    width INTEGER,
    height INTEGER,
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,
    CONSTRAINT PK_cages PRIMARY KEY (rowid),
    CONSTRAINT FK_cages_container FOREIGN KEY (container) REFERENCES core.Containers (EntityId)
);

DROP TABLE IF EXISTS cageui.cage_modifications_history;
CREATE TABLE cageui.cage_modifications_history
(
    rowid SERIAL NOT NULL,
    historyid VARCHAR NOT NULL,
    modid varchar NOT NULL,
    parent_modid varchar,
    modification varchar,
    subid INTEGER,
    location INTEGER,
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


DROP TABLE IF EXISTS cageui.cage_history;
CREATE TABLE cageui.cage_history
(
    rowid SERIAL NOT NULL,
    historyid VARCHAR NOT NULL,
    rack_group INTEGER NOT NULL,
    cage VARCHAR NOT NULL,
    mod_historyid VARCHAR,
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,
    CONSTRAINT PK_cage_history PRIMARY KEY (rowid),
    CONSTRAINT FK_cage_history_container FOREIGN KEY (container) REFERENCES core.Containers (EntityId)
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



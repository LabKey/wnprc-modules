/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
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

DROP TABLE IF EXISTS cageui.ghost_cages;
CREATE TABLE cageui.ghost_cages
(
    rowid SERIAL NOT NULL,
    cage_objectid VARCHAR NOT NULL,
    positionid INTEGER,
    rack_group INTEGER NOT NULL,
    rack_objectid VARCHAR NOT NULL,
    group_rotation INTEGER NOT NULL,
    cage INTEGER NOT NULL,
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,
    CONSTRAINT PK_ghost_cages PRIMARY KEY (rowid),
    CONSTRAINT FK_ghost_cages_container FOREIGN KEY (container) REFERENCES core.Containers (EntityId)
);

insert into ehr_lookups.lookups (set_name,container,value, category, title, description)
select setname, container, 8 as value, 'Caging' as category, 'Ghost Cage' as title, 4 as description from ehr_lookups.lookup_sets where setname='cageui_item_types';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 'ghostCage' as value, '/cageui/static/cage.svg' as title from ehr_lookups.lookup_sets where setname='cageui_svg_urls';

INSERT INTO ehr_lookups.lookup_sets (setname, label, description, keyField, container)
select 'adoption_status' as setname,
       'Adoption Status Field Values' as label,
       'List of possible adoption progress statuses' as description,
       'value' as keyField,
       container from ehr_lookups.lookup_sets where setname='ancestry';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 0 as value, 'Start' as title from ehr_lookups.lookup_sets where setname='adoption_status';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 1 as value, 'End' as title from ehr_lookups.lookup_sets where setname='adoption_status';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 2 as value, 'Pause' as title from ehr_lookups.lookup_sets where setname='adoption_status';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 3 as value, 'Resume' as title from ehr_lookups.lookup_sets where setname='adoption_status';


INSERT INTO ehr_lookups.lookup_sets (setname, label, description, keyField, container)
select 'adoption_results' as setname,
       'Adoption Result Field Values' as label,
       'List of possible adoption results' as description,
       'value' as keyField,
       container from ehr_lookups.lookup_sets where setname='ancestry';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 0 as value, 'Success' as title from ehr_lookups.lookup_sets where setname='adoption_results';

insert into ehr_lookups.lookups (set_name,container,value, title)
select setname, container, 1 as value, 'Failure' as title from ehr_lookups.lookup_sets where setname='adoption_results';

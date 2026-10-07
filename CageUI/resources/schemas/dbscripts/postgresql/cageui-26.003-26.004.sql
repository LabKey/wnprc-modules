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

DROP TABLE IF EXISTS cageui.ghost_racks;
CREATE TABLE cageui.ghost_racks
(
    rowid SERIAL NOT NULL,
    objectid VARCHAR NOT NULL,
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,
    CONSTRAINT PK_ghost_racks PRIMARY KEY (objectid),
    CONSTRAINT FK_ghost_racks_container FOREIGN KEY (container) REFERENCES core.Containers (EntityId)
);

ALTER TABLE cageui.all_history ADD COLUMN QCState INTEGER DEFAULT 1;

ALTER TABLE cageui.all_history ALTER COLUMN end_date TYPE TIMESTAMP;

ALTER TABLE cageui.all_history ALTER COLUMN start_date TYPE TIMESTAMP;

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'it' as value, 'In Transit' as title, 'special' as category, 'any' as description from ehr_lookups.lookup_sets where setname='housing_condition_codes';

ALTER TABLE cageui.rack_history ADD COLUMN ghost_rack_id VARCHAR;
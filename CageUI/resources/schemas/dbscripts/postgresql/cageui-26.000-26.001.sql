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

DROP TABLE IF EXISTS cageui.housing_condition_records;
CREATE TABLE cageui.housing_condition_records
(
    rowid SERIAL NOT NULL,
    housing VARCHAR NOT NULL,
    special_condition VARCHAR,
    pair_condition VARCHAR,
    cage_condition VARCHAR,
    social_condition VARCHAR,
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,
    CONSTRAINT PK_housing_condition_records PRIMARY KEY (rowid),
    CONSTRAINT FK_housing_condition_records_container FOREIGN KEY (container) REFERENCES core.Containers (EntityId)
);

INSERT INTO ehr_lookups.lookup_sets (setname, label, description, keyField, container)
select 'cageui_housing_condition_codes' as setname,
       'CageUI Housing Condition Code Field Values' as label,
       'Updated housing condition code list using categories' as description,
       'value' as keyField,
       container from ehr_lookups.lookup_sets where setname='ancestry';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'x' as value, 'special housing condition' as title, 'special' as category, 'any' as description from ehr_lookups.lookup_sets where setname='cageui_housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'c' as value, 'chair' as title, 'pairing' as category, 'any' as description from ehr_lookups.lookup_sets where setname='cageui_housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 's' as value, 'single' as title, 'pairing' as category, 'any' as description from ehr_lookups.lookup_sets where setname='cageui_housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'p' as value, 'paired' as title, 'pairing' as category, 'any' as description from ehr_lookups.lookup_sets where setname='cageui_housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'g' as value, 'in a group (+3 animals living together)' as title, 'pairing' as category, 'any' as description from ehr_lookups.lookup_sets where setname='cageui_housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'pc' as value, 'protected contact' as title, 'caging' as category, 'any' as description from ehr_lookups.lookup_sets where setname='cageui_housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'vc' as value, 'visual contact' as title, 'caging' as category, 'any' as description from ehr_lookups.lookup_sets where setname='cageui_housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'i' as value, 'mother/dam with infant' as title, 'social' as category, 'adult' as description from ehr_lookups.lookup_sets where setname='cageui_housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'ia' as value, 'mother/dam with adopted infant' as title, 'social' as category, 'adult' as description from ehr_lookups.lookup_sets where setname='cageui_housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'b' as value, 'breeding' as title, 'social' as category, 'adult' as description from ehr_lookups.lookup_sets where setname='cageui_housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'bi' as value, 'mother/dam in breeding with infant' as title, 'social' as category, 'adult' as description from ehr_lookups.lookup_sets where setname='cageui_housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'mf' as value, 'infant with the mother/dam and father/sire' as title, 'social' as category, 'infant' as description from ehr_lookups.lookup_sets where setname='cageui_housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'amf' as value, 'infant with father/sire and adopted mother/dam' as title, 'social' as category, 'infant' as description from ehr_lookups.lookup_sets where setname='cageui_housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'mfa' as value, 'infant with mother/dam and adopted father/sire' as title, 'social' as category, 'infant' as description from ehr_lookups.lookup_sets where setname='cageui_housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'mafa' as value, 'infant with adopted mother/dam and adopted father/sire' as title, 'social' as category, 'infant' as description from ehr_lookups.lookup_sets where setname='cageui_housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'm' as value, 'infant with the mother/dam' as title, 'social' as category, 'infant' as description from ehr_lookups.lookup_sets where setname='cageui_housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'f' as value, 'infant with the father/sire' as title, 'social' as category, 'infant' as description from ehr_lookups.lookup_sets where setname='cageui_housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'am' as value, 'infant with adopted mother/dam' as title, 'social' as category, 'infant' as description from ehr_lookups.lookup_sets where setname='cageui_housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'af' as value, 'infant with adopted father/sire' as title, 'social' as category, 'infant' as description from ehr_lookups.lookup_sets where setname='cageui_housing_condition_codes';



/*-- Update housing condition codes lookup by adding categories, these will be used in the above table to filter out which values belong where
UPDATE ehr_lookups.lookups
SET category = CASE
    WHEN value IN ('c', 's', 'p', 'b', 'pi', 'pia', 'pm', 'pma', 'pf', 'gmf', 'gm', 'gf', 'gma', 'g', 'gi', 'gia', 'gb', 'gbi') THEN 'Pairing'
    WHEN value IN ('vc', 'pc', 'gpc') THEN 'Caging'
    ELSE category  -- Keep existing category for values not in lists
END
    WHERE set_name='housing_condition_codes';*/

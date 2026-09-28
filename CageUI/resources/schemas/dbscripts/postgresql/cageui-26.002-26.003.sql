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
    objectid VARCHAR NOT NULL,
    special_condition VARCHAR,
    pair_condition VARCHAR,
    cage_condition VARCHAR,
    social_condition VARCHAR,
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,
    CONSTRAINT PK_housing_condition_records PRIMARY KEY (objectid),
    CONSTRAINT FK_housing_condition_records_container FOREIGN KEY (container) REFERENCES core.Containers (EntityId)
);


insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'i' as value, 'mother/dam with infant' as title, 'social' as category, 'adult' as description from ehr_lookups.lookup_sets where setname='housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'ia' as value, 'mother/dam with adopted infant' as title, 'social' as category, 'adult' as description from ehr_lookups.lookup_sets where setname='housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'bi' as value, 'mother/dam in breeding with infant' as title, 'social' as category, 'adult' as description from ehr_lookups.lookup_sets where setname='housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'mf' as value, 'infant with the mother/dam and father/sire' as title, 'social' as category, 'infant' as description from ehr_lookups.lookup_sets where setname='housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'amf' as value, 'infant with father/sire and adopted mother/dam' as title, 'social' as category, 'infant' as description from ehr_lookups.lookup_sets where setname='housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'mfa' as value, 'infant with mother/dam and adopted father/sire' as title, 'social' as category, 'infant' as description from ehr_lookups.lookup_sets where setname='housing_condition_codes';

insert into ehr_lookups.lookups (set_name,container,value,title,category,description)
select setname, container, 'mafa' as value, 'infant with adopted mother/dam and adopted father/sire' as title, 'social' as category, 'infant' as description from ehr_lookups.lookup_sets where setname='housing_condition_codes';


-- Update housing condition codes lookup by adding categories, these will be used in the above table to filter out which values belong where
UPDATE ehr_lookups.lookups
SET category = CASE
   WHEN value IN ('c', 's', 'p', 'g') THEN 'pairing'
   WHEN value IN ('vc') THEN 'caging'
   WHEN value IN ('b', 'm', 'f', 'af', 'am') THEN 'social'
   WHEN value IN ('x') THEN 'special'
   ELSE category  -- Keep existing category for values not in lists
END
WHERE set_name='housing_condition_codes';

-- Update housing codes by adding description; this description determines the animal age it can be used on (infant, adult, any)
UPDATE ehr_lookups.lookups
SET description = CASE
  WHEN value IN ('c', 's', 'p', 'g', 'vc', 'x') THEN 'any'
  WHEN value IN ('b') THEN 'adult'
  WHEN value IN ('m', 'f', 'am', 'af') THEN 'infant'
  ELSE description  -- Keep existing description for values not in lists
END
WHERE set_name='housing_condition_codes';

UPDATE ehr_lookups.lookups
SET date_disabled = CASE
    WHEN value IN ('gaf', 'gam', 'gamaf', 'gamf', 'gb', 'gbi', 'gbiaf', 'gf', 'gi', 'gia', 'gm', 'gma',
                   'gmaf', 'gmafa', 'gmf', 'gmfa', 'gpc', 'pc', 'pf', 'pfa', 'pi', 'pia', 'pm', 'pma', 'xs') THEN CURRENT_DATE
    ELSE date_disabled  -- Keep existing description for values not in lists
END
WHERE set_name='housing_condition_codes';
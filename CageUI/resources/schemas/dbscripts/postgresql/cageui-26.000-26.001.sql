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
    pair_condition VARCHAR,
    cage_condition VARCHAR,
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,
    CONSTRAINT PK_housing_condition_records PRIMARY KEY (rowid),
    CONSTRAINT FK_housing_condition_records_container FOREIGN KEY (container) REFERENCES core.Containers (EntityId)
);


-- Update housing condition codes lookup by adding categories, these will be used in the above table to filter out which values belong where
UPDATE ehr_lookups.lookups
SET category = CASE
    WHEN value IN ('c', 's', 'p', 'b', 'pi', 'pia', 'pm', 'pma', 'pf', 'gmf', 'gm', 'gf', 'gma', 'g', 'gi', 'gia', 'gb', 'gbi') THEN 'Pairing'
    WHEN value IN ('vc', 'pc', 'gpc') THEN 'Caging'
    ELSE category  -- Keep existing category for values not in lists
END
    WHERE set_name='housing_condition_codes';

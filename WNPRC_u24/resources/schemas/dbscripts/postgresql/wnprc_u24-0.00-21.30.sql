/*
 * Copyright (c) 2018-2019 LabKey Corporation
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

-- Create schema, tables, indexes, and constraints used for wnprc_u24 module here
-- All SQL VIEW definitions should be created in wnprc_u24-create.sql and dropped in wnprc_u24-drop.sql
-- Modify by Daniel Nicolalde to Postgres 07/26/2019
CREATE SCHEMA wnprc_u24;

CREATE TABLE wnprc_u24.lookupSets(
                                     RowId SERIAL NOT NULL,
                                     SetName VARCHAR(32) NOT NULL,
                                     Label VARCHAR(32) NOT NULL,
                                     ObjectId VARCHAR(128) NULL,
                                     Created TIMESTAMP NULL,
                                     CreatedBy USERID NULL,
                                     Modified TIMESTAMP NULL,
                                     ModifiedBy USERID NULL,
                                     DiCreated TIMESTAMP NULL,
                                     DiModified TIMESTAMP NULL,
                                     DiCreatedBy USERID NULL,
                                     DiModifiedBy USERID NULL,
                                     Container	entityId NOT NULL,

                                     CONSTRAINT pk_wnprc_u24_lookupsets PRIMARY KEY ( RowId ),
                                     CONSTRAINT fk_wnprc_u24_lookupsets_container FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);


CREATE UNIQUE INDEX idx_wnprc_u24_lookupSets_setname ON wnprc_u24.lookupSets ( SetName );


ALTER TABLE wnprc_u24.LookupSets ALTER ObjectId SET DEFAULT (ehr.uuid());


CREATE TABLE wnprc_u24.lookups(
                                  RowId SERIAL NOT NULL,
                                  SetName VARCHAR(32) NOT NULL,
                                  Value VARCHAR(128) NOT NULL,
                                  SortOrder INTEGER NULL,
                                  DateDisabled TIMESTAMP NULL,
                                  ObjectId VARCHAR(128) NULL,
                                  Created TIMESTAMP NULL,
                                  CreatedBy USERID NULL,
                                  Modified TIMESTAMP NULL,
                                  ModifiedBy USERID NULL,
                                  DiCreated TIMESTAMP NULL,
                                  DiModified TIMESTAMP NULL,
                                  DiCreatedBy USERID NULL,
                                  DiModifiedBy USERID NULL,
                                  Container	entityId NOT NULL,

                                  CONSTRAINT pk_wnprc_u24_lookups PRIMARY KEY ( RowId ),
                                  CONSTRAINT fk_wnprc_u24_lookups_SetName FOREIGN KEY (SetName) REFERENCES wnprc_u24.LookupSets (SetName),
                                  CONSTRAINT fk_wnprc_u24_lookups_container FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);


CREATE UNIQUE INDEX idx_wnprc_u24_lookups_setname ON wnprc_u24.lookups ( SetName , VALUE );


ALTER TABLE wnprc_u24.Lookups ALTER ObjectId SET DEFAULT (ehr.uuid());


ALTER TABLE wnprc_u24.SampleInventory ADD SampleWeight NUMERIC(7,2) NULL;
ALTER TABLE wnprc_u24.SampleInventory ADD SampleAmount NUMERIC(7,2) NULL;

CREATE TABLE wnprc_u24.RowsToDelete(
                                       ObjectId EntityId NOT NULL,
                                       Modified TIMESTAMP NOT NULL,
                                       CONSTRAINT pk_wnprc_u24_RowsToDelete PRIMARY KEY ( ObjectId )
);

CREATE TABLE wnprc_u24.WeightStaging (
                                         AnimalId VARCHAR(32) NOT NULL,
                                         PrimateId VARCHAR(10) NOT NULL,
                                         Date TIMESTAMP NOT NULL,
                                         Weight NUMERIC(7,4) NOT NULL,
                                         ObjectId EntityId NOT NULL,
                                         Created TIMESTAMP NULL,
                                         CreatedBy USERID NULL,
                                         Modified TIMESTAMP NULL,
                                         ModifiedBy USERID NULL,
                                         WeightMVIndicator VARCHAR(32) NULL,

                                         CONSTRAINT pk_wnprc_u24_weight_staging PRIMARY KEY (ObjectId )
);



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

-- Create schema, tables, indexes, and constraints used for wnprc_r24 module here
-- All SQL VIEW definitions should be created in wnprc_r24-create.sql and dropped in wnprc_r24-drop.sql
-- Modify by Daniel Nicolalde to Postgres 07/26/2019
CREATE SCHEMA wnprc_r24;


CREATE TABLE wnprc_R24.Biomarkers(
                                     RowId SERIAL NOT NULL,
                                     SampleId VARCHAR(32) NOT NULL,
                                     Lab VARCHAR(128) NULL,
                                     Analyte VARCHAR(128) NOT NULL,
                                     ObjectId VARCHAR(128),
                                     Value NUMERIC(6,2),
                                     Created TIMESTAMP NULL,
                                     CreatedBy USERID NULL,
                                     Modified TIMESTAMP NULL,
                                     ModifiedBy USERID NULL,
                                     DiCreated TIMESTAMP NULL,
                                     DiModified TIMESTAMP NULL,
                                     DiCreatedBy USERID NULL,
                                     DiModifiedBy USERID NULL,
                                     Container	entityId NOT NULL,


                                     CONSTRAINT PK_wnprc_r24_Biomarkers PRIMARY KEY (SampleId, Analyte),
                                     CONSTRAINT FK_wnprc_r24_Biomarkers_container FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
                                 );


ALTER TABLE wnprc_r24.Biomarkers ALTER  ObjectId SET DEFAULT (ehr.uuid());

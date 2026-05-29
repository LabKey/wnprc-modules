/*
 * Copyright (c) 2023-2026 Board of Regents of the University of Wisconsin System
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
DROP SCHEMA IF EXISTS wnprc_virology CASCADE;
CREATE SCHEMA wnprc_virology;

DROP TABLE IF EXISTS wnprc_virology.assays_llod;
CREATE TABLE wnprc_virology.assays_llod
(
    rowid		    serial NOT NULL,
    assay_name		text NOT NULL,
    start_date		TIMESTAMP NOT NULL,
    end_date		TIMESTAMP DEFAULT NULL,
    llod		    integer NOT NULL,

    -- Default fields for LabKey.
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,

    CONSTRAINT fk_assay_name FOREIGN KEY (assay_name) REFERENCES Viral_Load_Assay.assays(assayname),

    CONSTRAINT pk_assays_llod_rowid PRIMARY KEY (rowid)
);


/*
 * Copyright (c) 2022-2026 Board of Regents of the University of Wisconsin System
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
DROP TABLE IF EXISTS wnprc.arrow_protocols;
CREATE TABLE wnprc.arrow_protocols
(
    rowid               SERIAL NOT NULL,
    protocol_id	        VARCHAR(255),
    protocol_title	    VARCHAR(255),
    pi_name	            VARCHAR(255),
    date_approved	    TIMESTAMP,
    date_expiration	    TIMESTAMP,
    date_modified	    TIMESTAMP,
    arrow_common_name	VARCHAR(255),
    max_three_year	    INTEGER,
    usda_code	        VARCHAR(255),

    -- Default fields for LabKey.
    container           entityid NOT NULL,
    createdby           userid,
    created             TIMESTAMP,
    modifiedby          userid,
    modified            TIMESTAMP,

    CONSTRAINT PK_arrow_protocols_sequence PRIMARY KEY (rowid)
);

DROP TABLE IF EXISTS wnprc.extra_protocols;
CREATE TABLE wnprc.extra_protocols
(
    rowid               SERIAL NOT NULL,
    protocol_id	        VARCHAR(255),
    protocol_title	    VARCHAR(255),
    pi_name	            VARCHAR(255),
    date_approved	    TIMESTAMP,
    date_expiration	    TIMESTAMP,
    date_modified	    TIMESTAMP,
    arrow_common_name	VARCHAR(255),
    max_three_year	    INTEGER,
    usda_code	        VARCHAR(255),

    -- Default fields for LabKey.
    container           entityid NOT NULL,
    createdby           userid,
    created             TIMESTAMP,
    modifiedby          userid,
    modified            TIMESTAMP,

    CONSTRAINT PK_extra_protocols_sequence PRIMARY KEY (rowid)
);


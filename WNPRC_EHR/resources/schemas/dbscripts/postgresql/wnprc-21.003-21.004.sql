/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
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
DROP TABLE IF EXISTS wnprc.mgap_sequence_datasets;
CREATE TABLE wnprc.mgap_sequence_datasets
(
    mgap_id         VARCHAR(255) NOT NULL,
    sequence_type   VARCHAR(255),
    total_reads     INTEGER,
    sra_accession   VARCHAR(255),
    original_id     VARCHAR(255),
    parsed_id       VARCHAR(255),

    -- Default fields for LabKey.
    container       entityid NOT NULL,
    createdby       userid,
    created         TIMESTAMP,
    modifiedby      userid,
    modified        TIMESTAMP,

    CONSTRAINT PK_mgap_sequence_datasets PRIMARY KEY (mgap_id, sequence_type, sra_accession)
);

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
DROP TABLE IF EXISTS wnprc.session_log;
CREATE TABLE wnprc.session_log
(
    rowid                   serial NOT NULL,
    start_time              TIMESTAMP,
    end_time                TIMESTAMP,
    schema_name             varchar(100),
    query_name              varchar(100),
    task_id                 varchar(255),
    number_of_records       integer,
    batch_add_used          boolean,
    bulk_edit_used          boolean,
    user_agent              varchar(255),
    errors_occurred         boolean,
    form_framework_type     integer,

    -- Default fields for LabKey.
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,

    CONSTRAINT pk_session_log_rowid PRIMARY KEY (rowid),
    CONSTRAINT fk_session_log_form_framework_type FOREIGN KEY (form_framework_type) REFERENCES ehr.form_framework_types (rowid)
);


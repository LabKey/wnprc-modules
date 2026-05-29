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
CREATE TABLE wnprc.watermonitoring_access
(
    rowid                   serial                    NOT NULL,
    date                    TIMESTAMP,
    alloweduser             userid,
    project                 integer,
    principalinvestigator   varchar,
    createdby               userid,
    created                 TIMESTAMP,
    modifiedby              userid,
    modified                TIMESTAMP,
    CONSTRAINT PK_watermonitoring_access PRIMARY KEY (rowid)
);
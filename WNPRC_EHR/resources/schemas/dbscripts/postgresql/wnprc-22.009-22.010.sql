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
DROP TABLE IF EXISTS wnprc.urgent_treatments;
CREATE TABLE wnprc.urgent_treatments
(
    rowid SERIAL NOT NULL,
    code VARCHAR NOT NULL,
    instructions VARCHAR(255),
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,
    CONSTRAINT PK_urgent_treatments PRIMARY KEY (rowid),
    CONSTRAINT FK_urgent_treatments_container FOREIGN KEY (container) REFERENCES core.Containers (EntityId)
);
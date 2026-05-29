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
DROP TABLE IF EXISTS wnprc.on_call_calendars;
CREATE TABLE wnprc.on_call_calendars
(
    calendar_id             VARCHAR(100),
    calendar_type           VARCHAR(100),
    display_name            VARCHAR(500),
    api_action              VARCHAR(200),
    folder_id               VARCHAR(200),
    show_by_default         BOOLEAN DEFAULT TRUE,
    requires_authorization  BOOLEAN DEFAULT FALSE,
    default_bg_color        VARCHAR(20),
    authorized_groups       VARCHAR(500),

    -- Default fields for LabKey.
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,

    CONSTRAINT pk_on_call_calendar_id PRIMARY KEY (calendar_id)
);

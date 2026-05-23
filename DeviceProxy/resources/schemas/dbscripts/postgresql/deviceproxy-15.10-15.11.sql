/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
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
-- Create schema, tables, indexes, and constraints used for DeviceProxy module here
-- All SQL VIEW definitions should be created in deviceproxy-create.sql and dropped in deviceproxy-drop.sql
CREATE SCHEMA deviceproxy;

CREATE TABLE deviceproxy.device (
  public_key  TEXT NOT NULL,

  name        TEXT,
  description TEXT,

  CONSTRAINT PK_device_request PRIMARY KEY (public_key)
);

CREATE TABLE deviceproxy.lease (
  public_key TEXT NOT NULL,
  start_time TIMESTAMP NOT NULL,

  createdBy  USERID NOT NULL,
  end_time   TIMESTAMP,
  endedBy    USERID,
  endedOn    TIMESTAMP,

  CONSTRAINT PK_lease PRIMARY KEY (public_key, start_time),
  CONSTRAINT FK_lease_device FOREIGN KEY (public_key) REFERENCES deviceproxy.device (public_key)
);

CREATE TABLE deviceproxy.auth_method (
  public_key  TEXT NOT NULL,
  start_time  TIMESTAMP NOT NULL,
  auth_method TEXT NOT NULL,

  CONSTRAINT PK_auth_method PRIMARY KEY (public_key, start_time, auth_method),
  CONSTRAINT FK_auth_method_lease FOREIGN KEY (public_key, start_time) REFERENCES deviceproxy.lease (public_key, start_time)
);

CREATE TABLE deviceproxy.allowed_service (
  public_key   TEXT NOT NULL,
  start_time   TIMESTAMP NOT NULL,

  module_name  TEXT NOT NULL,
  service_name TEXT NOT NULL,

  CONSTRAINT PK_allowed_service PRIMARY KEY (public_key, start_time, module_name, service_name),
  CONSTRAINT FK_allowed_service_lease FOREIGN KEY (public_key, start_time) REFERENCES deviceproxy.lease (public_key, start_time)
);

CREATE TABLE deviceproxy.users (
  userid      USERID NOT NULL,

  card_number TEXT   NOT NULL,
  pin_hash    TEXT   NOT NULL,

  CONSTRAINT PK_users PRIMARY KEY (userid),
  CONSTRAINT users_cardnumber_unique UNIQUE (card_number)
);
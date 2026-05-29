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
ALTER TABLE wnprc_compliance.persons ADD COLUMN hold BOOLEAN DEFAULT false;
--update measles_required from wnprc_compliance.measles_clearances using labkey javascript API
ALTER TABLE wnprc_compliance.persons ADD COLUMN measles_required BOOLEAN DEFAULT false;



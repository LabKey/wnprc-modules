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
/*
 * Before running this SQL script, run the pg_testserver_change.sql.  This just contains the additional changes
 * after that to make it work with development boxes.
 */

UPDATE exp.propertydescriptor SET scale = 64 WHERE name IN ('FirstName', 'LastName', 'Phone', 'Mobile', 'Pager', 'IM') AND propertyuri LIKE '%:ExtensibleTable-core-Users.Folder-%' AND scale = 0;
UPDATE exp.propertydescriptor SET scale = 255 WHERE name IN ('Description') AND propertyuri LIKE '%:ExtensibleTable-core-Users.Folder-%' AND scale = 0;

UPDATE prop.properties SET value = FALSE WHERE (set = 1 AND name = 'sslRequired');
UPDATE prop.properties SET value = 'http://localhost:8080' WHERE (set = 1 AND name = 'baseServerURL');

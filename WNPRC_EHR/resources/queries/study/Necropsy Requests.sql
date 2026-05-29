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
 * This query represents all outstanding requests that need to be approved
 */

SELECT
requestid as lsid,
requestid.rowid as requestid,
Id as animalid, 
"date",
created,
caseno,
project,
account,
location,
performedby as pathologist,
requestid.qcstate as state,
comments as comments,
createdby.displayname as requestor,
requestid.priority as priority


FROM study.necropsies
WHERE requestid IS NOT NULL
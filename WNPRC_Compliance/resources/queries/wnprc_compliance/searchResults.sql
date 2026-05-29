/*
 * Copyright (c) 2017-2026 Board of Regents of the University of Wisconsin System
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
-- noinspection SqlNoDataSourceInspectionForFile

-- noinspection SqlDialectInspectionForFile,SqlNoDataSourceInspection

SELECT
id,
first_name,
middle_name,
last_name,
COALESCE(display, '') as display,
LCASE(display) as displayLcase,
COALESCE(notes, '') as notes,
"type"

FROM (
  SELECT
  CAST(userid as VARCHAR) as id,
  firstName as first_name,
  '' as middle_name,
  lastName as last_name,
  COALESCE(
    firstName || ' ' || lastName || ' (' || displayName || ')',
    displayName,
    CAST(userid as VARCHAR)
  ) as display,
  '' as notes,
  'LABKEY USER' as type,

  FROM core.users

  UNION

  SELECT
  card_id as id,
  first_name,
  COALESCE(middle_name, ''),
  last_name,
  COALESCE(first_name, '') || ' ' || COALESCE(middle_name, '') || ' ' || COALESCE(last_name, '') || ' (' || card_id || ')' as display,
  COALESCE(department || ';', '') || COALESCE(info2 || ';', '') || COALESCE(info3 || ';', '') as notes,
  'UW CARD' as type

  FROM wnprc_compliance.mostRecentCardInfo


  UNION


  SELECT
  personid as id,
  first_name,
  COALESCE(middle_name, ''),
  last_name,
  COALESCE(first_name, '') || ' ' || COALESCE(middle_name, '') || ' ' || COALESCE(last_name, '') as display,
  notes,
  'PERSONS' as type

  FROM wnprc_compliance.persons
) ORDER BY last_name ASC
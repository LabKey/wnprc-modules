/*
 * Copyright (c) 2016-2018 LabKey Corporation
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
SELECT
  d.participantid as animalId,
  d.participantid.primateId.primateId AS primateId,
  d.vendor_id as neprcId,
  d.birth,
  d.death,
  d.calculated_status.code as status,
  d.objectid,
  d.species.id_prefix as species,
  -- Animals born at NEPRC and animals with both parents born at NEPRC
  -- have NEPRC as the sourceColony.  All others have SNPRC.
  CASE d.origin.code
	WHEN 'cal' then 'NEPRC'
	WHEN 'nec' then 'NEPRC'
	WHEN 'opc' then 'NEPRC'
	WHEN 'swn' then 'NEPRC'
	WHEN 'ypc' then 'NEPRC'
	WHEN 'ucd' then 'NEPRC'
	ELSE CASE WHEN  iDam.id IS NOT NULL AND iSire.id IS NOT null
			  THEN 'NEPRC'
    ELSE 'WNPRC' END
  END AS sourceColony,

  'WNPRC' as currentColony,
  d.gender.code as gender,
  d.dam,
  d.sire,
  d.modified as modified,
  curdate() as date,
  CASE d.participantid.activeAssignments.projects
    WHEN '20210102' THEN true
    ELSE false
  END AS U24_Animals
FROM study.demographics d

LEFT OUTER JOIN study.demographics as ih on d.id = ih.id and ih.origin.code in
	('cal', 'cen', 'nec', 'opc', 'swn', 'ypc', 'ucd')
-- is dam from NEPRC?
LEFT OUTER JOIN study.demographics as iDam ON iDam.id = d.dam AND  iDam.origin.code IN
	('cal', 'cen', 'nec', 'opc', 'swn', 'ypc', 'ucd')
-- is sire from NEPRC?
LEFT OUTER JOIN study.demographics as iSire ON iSire.id = d.sire AND iSire.origin.code IN
    ('cal', 'cen', 'nec', 'opc', 'swn', 'ypc', 'ucd')

WHERE d.species.id_prefix = 'cj'

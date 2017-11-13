/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
id,
date as date,
ts,
objectid AS LabKeyUUID,
'arrival' as type,
key2 AS mySQL_UUID
FROM col_dump.arrival_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid AS LabKeyUUID,
'assignment' as type,
key2 AS mySQL_UUID
FROM col_dump.assignment_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid AS LabKeyUUID,
'bactresults' as type,
key2 AS mySQL_UUID
FROM col_dump.bacteriologyresults_mysql

UNION ALL

-- SELECT
-- id,
-- date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'bactruns' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.bacteriologyruns_mysql
--
-- UNION ALL

-- SELECT
-- id,
-- date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'behave' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.behavetrem_mysql
--
-- UNION ALL

SELECT
id,
date,
ts,
objectid AS LabKeyUUID,
'biopsy' as type,
key2 AS mySQL_UUID
FROM col_dump.biopsy_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid AS LabKeyUUID,
'morphologicdiag' as type,
key2 AS mySQL_UUID
FROM col_dump.morphologicdiag_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid AS LabKeyUUID,
'birth' as type,
key2 AS mySQL_UUID
FROM col_dump.birth_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid AS LabKeyUUID,
'blood' as type,
key2 AS mySQL_UUID
FROM col_dump.blood_mysql

-- UNION ALL
--
-- SELECT
-- null as id,
-- null as date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'cage' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.cage_mysql

-- UNION ALL
--
-- SELECT
-- null as id,
-- null as date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'cageclass' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.cageclass_mysql

-- UNION ALL
--
-- SELECT
-- null as id,
-- date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'cagenotes' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.cagenotes_mysql

-- UNION ALL

-- SELECT
-- null as id,
-- date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'cageobservations' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.cageobservations_mysql
--
-- UNION ALL
--
-- SELECT
-- null as id,
-- date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'clinpathRuns' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.clinpath_runs_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid AS LabKeyUUID,
'chemresults' as type,
key2 AS mySQL_UUID
FROM col_dump.chemistryresults_mysql

-- UNION ALL
--
-- SELECT
-- id,
-- date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'chemruns' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.chemistryruns_mysql

-- UNION ALL
--
-- SELECT
-- null as id,
-- null as date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'chemnorm' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.chemnorm_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid AS LabKeyUUID,
'clinremarks' as type,
key2 AS mySQL_UUID
FROM col_dump.clinremarks_mysql

UNION ALL

-- SELECT
-- id,
-- date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'demographics' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.demographics_mysql
--
-- UNION ALL

SELECT
id,
date,
ts,
objectid AS LabKeyUUID,
'departure' as type,
key2 AS mySQL_UUID
FROM col_dump.departure_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid AS LabKeyUUID,
'drug' as type,
key2 AS mySQL_UUID
FROM col_dump.drug_mysql

UNION ALL

-- SELECT
-- id,
-- date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'hemamorph' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.hematologymorphology_mysql
--
-- UNION ALL

SELECT
id,
date,
ts,
objectid AS LabKeyUUID,
'hemaresults' as type,
key2 AS mySQL_UUID
FROM col_dump.hematologyresults_mysql

UNION ALL

-- SELECT
-- id,
-- date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'hemaruns' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.hematologyruns_mysql

-- UNION ALL
--
-- SELECT
-- null as id,
-- null as date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'hold' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.hold_mysql

-- UNION ALL

SELECT
id,
date,
ts,
objectid AS LabKeyUUID,
'housing' as type,
key2 AS mySQL_UUID
FROM col_dump.housing_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid AS LabKeyUUID,
'immunoresults' as type,
key2 AS mySQL_UUID
FROM col_dump.immunologyresults_mysql

UNION ALL

-- SELECT
-- id,
-- date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'immunoruns' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.immunologyruns_mysql
--
-- UNION ALL

SELECT
id,
date,
ts,
objectid AS LabKeyUUID,
'necropsy' as type,
key2 AS mySQL_UUID
FROM col_dump.necropsy_mysql

UNION ALL

-- SELECT
-- id,
-- date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'necropsydiag' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.necropsydiag_mysql
--
-- UNION ALL

-- SELECT
-- null as id,
-- null as date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'newsnomed' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.newsnomed_mysql

-- UNION ALL
--
-- SELECT
-- id,
-- date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'obs' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.obs_mysql

-- UNION ALL

SELECT
id,
date,
ts,
objectid AS LabKeyUUID,
'parasitologyresults' as type,
key2 AS mySQL_UUID
FROM col_dump.parasitologyresults_mysql

UNION ALL
--
-- SELECT
-- id,
-- date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'parasitologyruns' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.parasitologyruns_mysql

-- UNION ALL
--
-- SELECT
-- null as id,
-- null as date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'perdiem' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.perdiemrates_mysql

-- UNION ALL

SELECT
id,
date,
ts,
objectid AS LabKeyUUID,
'prenatal' as type,
key2 AS mySQL_UUID
FROM col_dump.prenatal_mysql

UNION ALL
--
-- SELECT
-- id,
-- date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'problem' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.problem_mysql

-- UNION ALL
--
-- SELECT
-- id,
-- date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'procedures' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.procedures_mysql

-- UNION ALL

-- SELECT
-- null as id,
-- null as date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'project' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.project_mysql
--
-- UNION ALL

-- SELECT
-- null as id,
-- null as date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'protocol_counts' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.protocol_counts_mysql
--
-- UNION ALL

-- SELECT
-- null as id,
-- null as date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'protocol' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.protocol_mysql
--
-- UNION ALL

-- SELECT
-- null as id,
-- null as date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'ref_range' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.ref_range_mysql
--
-- UNION ALL

-- SELECT
-- null as id,
-- null as date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'rhesaux' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.rhesaux_mysql
--
-- UNION ALL
--
-- SELECT
-- null as id,
-- null as date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'snomap' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.snomap_mysql

-- UNION ALL

-- SELECT
-- null as id,
-- null as date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'snomed' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.snomed_mysql
--
-- UNION ALL

-- SELECT
-- id,
-- date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'surgsum' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.surgsum_mysql
--
-- UNION ALL

SELECT
id,
date,
ts,
objectid AS LabKeyUUID,
'tb' as type,
key2 AS mySQL_UUID
FROM col_dump.tb_mysql

UNION ALL

-- SELECT
-- id,
-- date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'tissue_requests' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.tissue_requests_mysql
--
-- UNION ALL

SELECT
id,
date,
ts,
objectid AS LabKeyUUID,
'treatments' as type,
key2 AS mySQL_UUID
FROM col_dump.treatment_order_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid AS LabKeyUUID,
'urinalysisresults' as type,
key2 AS mySQL_UUID
FROM col_dump.urinalysisresults_mysql

UNION ALL

-- SELECT
-- id,
-- date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'urinalysisruns' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.urinalysisruns_mysql
--
-- UNION ALL

SELECT
id,
date,
ts,
objectid AS LabKeyUUID,
'virologyresults' as type,
key2 AS mySQL_UUID
FROM col_dump.virologyresults_mysql

-- UNION ALL

-- SELECT
-- id,
-- date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'virologyruns' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.virologyruns_mysql
--
UNION ALL

SELECT
id,
date,
ts,
objectid AS LabKeyUUID,
'weight' as type,
key2 AS mySQL_UUID
FROM col_dump.weight_mysql


-- UNION ALL
--
-- SELECT
-- null as id,
-- null as date,
-- ts,
-- objectid AS LabKeyUUID,
-- 'snomap_list' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.snomap_list

-- UNION ALL
--
-- SELECT
-- code as id,
-- null as date,
-- ts,
-- code AS LabKeyUUID,
-- 'snomed_list' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.snomed_list

-- UNION ALL
--
-- SELECT
-- code as id,
-- null as date,
-- ts,
-- code AS LabKeyUUID,
-- 'full_snomed_list' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.full_snomed_list

-- UNION ALL
--
-- SELECT
-- cast(project as varchar) as id,
-- null as date,
-- ts,
-- cast(project as varchar) AS LabKeyUUID,
-- 'project_list' as type,
-- cast(key2 as varchar) AS mySQL_UUID
-- FROM col_dump.project_list

-- UNION ALL
--
-- SELECT
-- protocol as id,
-- null as date,
-- ts,
-- protocol AS LabKeyUUID,
-- 'protocol_list' as type,
-- key2 AS mySQL_UUID
-- FROM col_dump.protocol_list
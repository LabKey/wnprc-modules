/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
DROP TRIGGER IF EXISTS abstract_delete;
delimiter $$
CREATE TRIGGER abstract_delete BEFORE DELETE ON abstract
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'abstract', 'demographics', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'abstract', 'deaths', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'abstract', 'birth', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'abstract', 'alerts', 'dataset');
END

$$ DELIMITER ;

DROP TRIGGER IF EXISTS arrival_delete;
CREATE TRIGGER arrival_delete BEFORE DELETE ON arrival
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'arrival', 'arrival', 'dataset');


DROP TRIGGER IF EXISTS assignment_delete;
delimiter $$
CREATE TRIGGER assignment_delete BEFORE DELETE ON assignment
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'assignment', 'assignment', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'assignment', 'alerts', 'dataset');
END
;
$$ DELIMITER ;

DROP TRIGGER IF EXISTS bacteriology_delete;
delimiter $$
CREATE TRIGGER bacteriology_delete BEFORE DELETE ON bacteriology
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'bacteriology', 'bacteriologyRuns', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'bacteriology', 'clinpathRuns', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'bacteriology', 'bacteriologyResults', 'dataset');
END
;
$$ DELIMITER ;

DROP TRIGGER IF EXISTS behavedrug_delete;
CREATE TRIGGER behavedrug_delete BEFORE DELETE ON behavedrug
FOR EACH ROW
insert into colony.deleted_records (uuid, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'behavedrug', 'drug', 'dataset')
;
DROP TRIGGER IF EXISTS behavehead_delete;
/*
CREATE TRIGGER behavehead_delete BEFORE DELETE ON behavehead
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'behavehead', 'encounters', 'dataset')
;
*/
DROP TRIGGER IF EXISTS behavetrem_delete;
CREATE TRIGGER behavetrem_delete BEFORE DELETE ON behavetrem
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'behavetrem', 'behavetrem', 'dataset')
;
DROP TRIGGER IF EXISTS biopsydiag_delete;
CREATE TRIGGER biopsydiag_delete BEFORE DELETE ON biopsydiag
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'biopsydiag', 'biopsydiag', 'dataset')
;
DROP TRIGGER IF EXISTS biopsyhead_delete;
delimiter $$
CREATE TRIGGER biopsyhead_delete BEFORE DELETE ON biopsyhead
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'biopsyhead', 'biopsy', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'biopsyhead', 'encounters', 'dataset');
END
$$ DELIMITER ;
DROP TRIGGER IF EXISTS birth_delete;
CREATE TRIGGER birth_delete BEFORE DELETE ON birth
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'birth', 'birth', 'dataset')
;
DROP TRIGGER IF EXISTS blood_delete;
CREATE TRIGGER blood_delete BEFORE DELETE ON blood
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'blood', 'blood', 'dataset')
;
DROP TRIGGER IF EXISTS bloodgas_delete;
CREATE TRIGGER bloodgas_delete BEFORE DELETE ON bloodgas
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'bloodgas', 'bloodgas', 'dataset')
;
DROP TRIGGER IF EXISTS cage_delete;
CREATE TRIGGER cage_delete BEFORE DELETE ON cage
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.cage, 'cage', 'cage', 'lists')
;
DROP TRIGGER IF EXISTS cageclass_delete;
CREATE TRIGGER cageclass_delete BEFORE DELETE ON cageclass
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, '', 'cageclass', 'cageclass', 'lists')
;
DROP TRIGGER IF EXISTS cagenotes_delete;
delimiter $$
CREATE TRIGGER cagenotes_delete BEFORE DELETE ON cagenotes
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.cage, 'cagenotes', 'cagenotes', 'lists');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.cage, 'cagenotes', 'cageObs', 'dataset');
END
;
$$ DELIMITER ;

DROP TRIGGER IF EXISTS cases_delete;
CREATE TRIGGER cases_delete BEFORE DELETE ON cases
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'cases', 'problem', 'dataset')
;

DROP TRIGGER IF EXISTS chemisc_delete;
delimiter $$
CREATE TRIGGER chemisc_delete BEFORE DELETE ON chemisc
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'chemisc', 'chemistryResults', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'chemisc', 'chemistryRuns', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'chemisc', 'clinpathRuns', 'dataset');
END
;
$$ DELIMITER ;

DROP TRIGGER IF EXISTS chemisc2_delete;
delimiter $$
CREATE TRIGGER chemisc2_delete BEFORE DELETE ON chemisc2
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'chemisc2', 'chemistryResults', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'chemisc2', 'chemistryRuns', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'chemisc2', 'clinpathRuns', 'dataset');
END
;
$$ DELIMITER ;

DROP TRIGGER IF EXISTS chemistry_delete;
delimiter $$
CREATE TRIGGER chemistry_delete BEFORE DELETE ON chemistry
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'chemistry', 'chemistryResults', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'chemistry', 'chemistryRuns', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'chemistry', 'clinpathRuns', 'dataset');
END
;$$ DELIMITER ;

DROP TRIGGER IF EXISTS chemnorm_delete;
CREATE TRIGGER chemnorm_delete BEFORE DELETE ON chemnorm
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.testname, 'chemnorm', 'chemnorm', 'lists')
;
DROP TRIGGER IF EXISTS clindrug_delete;
CREATE TRIGGER clindrug_delete BEFORE DELETE ON clindrug
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'clindrug', 'drug', 'dataset')
;
DROP TRIGGER IF EXISTS clinhead_delete;
/*
CREATE TRIGGER clinhead_delete BEFORE DELETE ON clinhead
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'clinhead', 'encounters', 'dataset')
;
*/
DROP TRIGGER IF EXISTS clinpathmisc_delete;
CREATE TRIGGER clinpathmisc_delete BEFORE DELETE ON clinpathmisc
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'clinpathmisc', 'clinpathmisc', 'none')
;
DROP TRIGGER IF EXISTS clintrem_delete;
CREATE TRIGGER clintrem_delete BEFORE DELETE ON clintrem
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'clintrem', 'clinremarks', 'dataset')
;
DROP TRIGGER IF EXISTS departure_delete;
CREATE TRIGGER departure_delete BEFORE DELETE ON departure
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'departure', 'departure', 'dataset')
;
DROP TRIGGER IF EXISTS electrolyte_delete;
CREATE TRIGGER electrolyte_delete BEFORE DELETE ON electrolyte
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'electrolyte', 'electrolyte', 'none')
;
DROP TRIGGER IF EXISTS electrophor_delete;
CREATE TRIGGER electrophor_delete BEFORE DELETE ON electrophor
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'electrophor', 'electrophor', 'none')
;
DROP TRIGGER IF EXISTS enzyme_delete;
CREATE TRIGGER enzyme_delete BEFORE DELETE ON enzyme
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'enzyme', 'enzyme', 'none')
;
DROP TRIGGER IF EXISTS files_delete;
CREATE TRIGGER files_delete BEFORE DELETE ON files
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'files', 'files', 'none')
;
DROP TRIGGER IF EXISTS gtt_delete;
CREATE TRIGGER gtt_delete BEFORE DELETE ON gtt
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'gtt', 'gtt', 'none')
;
DROP TRIGGER IF EXISTS hemamisc_delete;
CREATE TRIGGER hemamisc_delete BEFORE DELETE ON hemamisc
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'hemamisc', 'hematologyMorphology', 'dataset')
;

DROP TRIGGER IF EXISTS hematology_delete;
delimiter $$
CREATE TRIGGER hematology_delete BEFORE DELETE ON hematology
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'hematology', 'hematologyRuns', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'hematology', 'clinpathRuns', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'hematology', 'hematologyResults', 'dataset');
END
;$$ DELIMITER ;

DROP TRIGGER IF EXISTS holdcode_delete;
CREATE TRIGGER holdcode_delete BEFORE DELETE ON holdcode
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.code, 'holdcode', 'hold', 'lists')
;
DROP TRIGGER IF EXISTS hormdrug_delete;
CREATE TRIGGER hormdrug_delete BEFORE DELETE ON hormdrug
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'hormdrug', 'drug', 'dataset')
;
DROP TRIGGER IF EXISTS hormhead_delete;
/*
CREATE TRIGGER hormhead_delete BEFORE DELETE ON hormhead
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'hormhead', 'encounters', 'dataset')
;
*/
DROP TRIGGER IF EXISTS hormtrem_delete;
CREATE TRIGGER hormtrem_delete BEFORE DELETE ON hormtrem
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'hormtrem', 'clinremarks', 'dataset')
;
DROP TRIGGER IF EXISTS housing_delete;
CREATE TRIGGER housing_delete BEFORE DELETE ON housing
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'housing', 'housing', 'dataset')
;
DROP TRIGGER IF EXISTS id_delete;
CREATE TRIGGER id_delete BEFORE DELETE ON id
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'id', 'id', 'none')
;
DROP TRIGGER IF EXISTS immunohead_delete;
delimiter $$
CREATE TRIGGER immunohead_delete BEFORE DELETE ON immunohead
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'immunohead', 'immunologyRuns', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'immunohead', 'clinpathRuns', 'dataset');
END
;$$ DELIMITER;

DROP TRIGGER IF EXISTS immunores_delete;
delimiter $$
CREATE TRIGGER immunores_delete BEFORE DELETE ON immunores
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'immunores', 'immunologyResults', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'immunores', 'immunologyRuns', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'immunores', 'clinpathRuns', 'dataset');
END
;$$ DELIMITER ;

DROP TRIGGER IF EXISTS labanimals_delete;
CREATE TRIGGER labanimals_delete BEFORE DELETE ON labanimals
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'labanimals', 'labanimals', 'none')
;
DROP TRIGGER IF EXISTS lapid_delete;
CREATE TRIGGER lapid_delete BEFORE DELETE ON lapid
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'lapid', 'lapid', 'none')
;
DROP TRIGGER IF EXISTS lipid_delete;
CREATE TRIGGER lipid_delete BEFORE DELETE ON lipid
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'lipid', 'lipid', 'none')
;
DROP TRIGGER IF EXISTS marmaux_delete;
CREATE TRIGGER marmaux_delete BEFORE DELETE ON marmaux
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'marmaux', 'marmaux', 'none')
;
DROP TRIGGER IF EXISTS mhctype_delete;
CREATE TRIGGER mhctype_delete BEFORE DELETE ON mhctype
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'mhctype', 'mhctype', 'none')
;
DROP TRIGGER IF EXISTS monitoranes_delete;
CREATE TRIGGER monitoranes_delete BEFORE DELETE ON monitoranes
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'monitoranes', 'monitoranes', 'none')
;
DROP TRIGGER IF EXISTS monitorfluid_delete;
CREATE TRIGGER monitorfluid_delete BEFORE DELETE ON monitorfluid
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'monitorfluid', 'monitorfluid', 'none')
;
DROP TRIGGER IF EXISTS monitorhead_delete;
CREATE TRIGGER monitorhead_delete BEFORE DELETE ON monitorhead
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'monitorhead', 'monitorhead', 'none')
;
DROP TRIGGER IF EXISTS monitormed_delete;
CREATE TRIGGER monitormed_delete BEFORE DELETE ON monitormed
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'monitormed', 'monitormed', 'none')
;
DROP TRIGGER IF EXISTS monitorsign_delete;
CREATE TRIGGER monitorsign_delete BEFORE DELETE ON monitorsign
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'monitorsign', 'monitorsign', 'none')
;
DROP TRIGGER IF EXISTS necropsydiag_delete;
CREATE TRIGGER necropsydiag_delete BEFORE DELETE ON necropsydiag
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'necropsydiag', 'necropsydiag', 'dataset')
;
DROP TRIGGER IF EXISTS necropsyhead_delete;
DELIMITER $$
CREATE TRIGGER necropsyhead_delete BEFORE DELETE ON necropsyhead
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'necropsyhead', 'necropsy', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'necropsyhead', 'encounters', 'dataset');
END
$$ DELIMITER ;
DROP TRIGGER IF EXISTS newsnomed_delete;
CREATE TRIGGER newsnomed_delete BEFORE DELETE ON newsnomed
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.code, 'newsnomed', 'newsnomed', 'list')
;
DROP TRIGGER IF EXISTS obs_delete;
CREATE TRIGGER obs_delete BEFORE DELETE ON obs
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'obs', 'obs', 'dataset')
;
DROP TRIGGER IF EXISTS parahead_delete;
DELIMITER $$
CREATE TRIGGER parahead_delete BEFORE DELETE ON parahead
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'parahead', 'parasitologyRuns', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'parahead', 'clinpathRuns', 'dataset');
END
; $$ DELIMITER ;
DROP TRIGGER IF EXISTS parares_delete;
CREATE TRIGGER parares_delete BEFORE DELETE ON parares
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'parares', 'parasitologyResults', 'dataset')
;
DROP TRIGGER IF EXISTS pedigree_delete;
CREATE TRIGGER pedigree_delete BEFORE DELETE ON pedigree
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'pedigree', 'pedigree', 'dataset')
;
DROP TRIGGER IF EXISTS perdiemrates_delete;
CREATE TRIGGER perdiemrates_delete BEFORE DELETE ON perdiemrates
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.type, 'perdiemrates', 'perdiemrates', 'list')
;
DROP TRIGGER IF EXISTS prenatal_delete;
CREATE TRIGGER prenatal_delete BEFORE DELETE ON prenatal
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'prenatal', 'prenatal', 'dataset')
;
DROP TRIGGER IF EXISTS project_delete;
CREATE TRIGGER project_delete BEFORE DELETE ON project
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.pno, 'project', 'project', 'lists')
;

DROP TRIGGER IF EXISTS protocol_delete;
DELIMITER $$
CREATE TRIGGER protocol_delete BEFORE DELETE ON protocol
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.protocol, 'protocol', 'protocol', 'list');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.protocol, 'protocol', 'protocol_counts', 'list');
END
$$ DELIMITER ;

DROP TRIGGER IF EXISTS ref_range_delete;
CREATE TRIGGER ref_range_delete BEFORE DELETE ON ref_range
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.test, 'ref_range', 'ref_range', 'list')
;
DROP TRIGGER IF EXISTS rhesaux_delete;
CREATE TRIGGER rhesaux_delete BEFORE DELETE ON rhesaux
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'rhesaux', 'rhesaux', 'none')
;
DROP TRIGGER IF EXISTS snomap_delete;
CREATE TRIGGER snomap_delete BEFORE DELETE ON snomap
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.ocode, 'snomap', 'snomap', 'list')
;
DROP TRIGGER IF EXISTS snomed_delete;
CREATE TRIGGER snomed_delete BEFORE DELETE ON snomed
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.code, 'snomed', 'snomed', 'list')
;
DROP TRIGGER IF EXISTS surganes_delete;
CREATE TRIGGER surganes_delete BEFORE DELETE ON surganes
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'surganes', 'drug', 'dataset')
;
DROP TRIGGER IF EXISTS surgfluid_delete;
CREATE TRIGGER surgfluid_delete BEFORE DELETE ON surgfluid
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'surgfluid', 'drug', 'dataset')
;
DROP TRIGGER IF EXISTS surghead_delete;
delimiter $$
CREATE TRIGGER surghead_delete BEFORE DELETE ON surghead
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'surghead', 'surgery', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'surghead', 'encounters', 'dataset');
END
$$ DELIMITER ;

DROP TRIGGER IF EXISTS surgmed_delete;
CREATE TRIGGER surgmed_delete BEFORE DELETE ON surgmed
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'surgmed', 'drug', 'dataset')
;
DROP TRIGGER IF EXISTS surgpost_delete;
CREATE TRIGGER surgpost_delete BEFORE DELETE ON surgpost
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'surgpost', 'surgpost', 'none')
;
DROP TRIGGER IF EXISTS surgproc_delete;
CREATE TRIGGER surgproc_delete BEFORE DELETE ON surgproc
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'surgproc', 'procedures', 'dataset')
;
DROP TRIGGER IF EXISTS surgsum_delete;
CREATE TRIGGER surgsum_delete BEFORE DELETE ON surgsum
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'surgsum', 'surgsum', 'dataset')
;
DROP TRIGGER IF EXISTS tb_delete;
CREATE TRIGGER tb_delete BEFORE DELETE ON tb
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'tb', 'tb', 'dataset')
;
DROP TRIGGER IF EXISTS tissue_delete;
CREATE TRIGGER tissue_delete BEFORE DELETE ON tissue
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'tissue', 'tissue_requests', 'dataset')
;
DROP TRIGGER IF EXISTS treatments_delete;
CREATE TRIGGER treatments_delete BEFORE DELETE ON treatments
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'treatments', 'treatment_order', 'dataset')
;

DROP TRIGGER IF EXISTS urine_delete;
delimiter $$
CREATE TRIGGER urine_delete BEFORE DELETE ON urine
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'urine', 'urinalysisRuns', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'urine', 'clinpathRuns', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'urine', 'urinalysisResults', 'dataset');
END
;$$ DELIMITER ;

DROP TRIGGER IF EXISTS virisohead_delete;
delimiter $$
CREATE TRIGGER virisohead_delete BEFORE DELETE ON virisohead
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'virisohead', 'virologyRuns', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'virisohead', 'clinpathRuns', 'dataset');
END
;$$ DELIMITER ;

DROP TRIGGER IF EXISTS virisores_delete;
CREATE TRIGGER virisores_delete BEFORE DELETE ON virisores
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'virisores', 'virologyResults', 'dataset')
;
DROP TRIGGER IF EXISTS virserohead_delete;
delimiter $$
CREATE TRIGGER virserohead_delete BEFORE DELETE ON virserohead
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'virserohead', 'virologyRuns', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'virserohead', 'clinpathRuns', 'dataset');
END
;$$ DELIMITER ;

DROP TRIGGER IF EXISTS virserores_delete;
CREATE TRIGGER virserores_delete BEFORE DELETE ON virserores
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'virserores', 'virologyResults', 'dataset')
;
DROP TRIGGER IF EXISTS weight_delete;
CREATE TRIGGER weight_delete BEFORE DELETE ON weight
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'weight', 'weight', 'dataset')
;


DROP TRIGGER IF EXISTS necropsydiag_delete;
delimiter $$
CREATE TRIGGER necropsydiag_delete BEFORE DELETE ON necropsydiag
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'necropsydiag', 'necropsydiag', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'necropsydiag', 'morphologicDiagnosis', 'dataset');
END
;$$ DELIMITER ;

DROP TRIGGER IF EXISTS biopsydiag_delete;
delimiter $$
CREATE TRIGGER biopsydiag_delete BEFORE DELETE ON biopsydiag
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'biopsydiag', 'necropsydiag', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'biopsydiag', 'morphologicDiagnosis', 'dataset');
END
;$$ DELIMITER ;

/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
DROP TRIGGER IF EXISTS abstract_uuid;
DELIMITER $$
CREATE TRIGGER abstract_uuid BEFORE INSERT ON abstract
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS arrival_uuid;
DELIMITER $$
CREATE TRIGGER arrival_uuid BEFORE INSERT ON arrival
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS assignment_uuid;
DELIMITER $$
CREATE TRIGGER assignment_uuid BEFORE INSERT ON assignment
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS bacteriology_uuid;
DELIMITER $$
CREATE TRIGGER bacteriology_uuid BEFORE INSERT ON bacteriology
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS behavedrug_uuid;
DELIMITER $$
CREATE TRIGGER behavedrug_uuid BEFORE INSERT ON behavedrug
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS behavehead_uuid;
DELIMITER $$
CREATE TRIGGER behavehead_uuid BEFORE INSERT ON behavehead
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS behavetrem_uuid;
DELIMITER $$
CREATE TRIGGER behavetrem_uuid BEFORE INSERT ON behavetrem
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS biopsydiag_uuid;
DELIMITER $$
CREATE TRIGGER biopsydiag_uuid BEFORE INSERT ON biopsydiag
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS biopsyhead_uuid;
DELIMITER $$
CREATE TRIGGER biopsyhead_uuid BEFORE INSERT ON biopsyhead
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS birth_uuid;
DELIMITER $$
CREATE TRIGGER birth_uuid BEFORE INSERT ON birth
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS blood_uuid;
DELIMITER $$
CREATE TRIGGER blood_uuid BEFORE INSERT ON blood
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS bloodgas_uuid;
DELIMITER $$
CREATE TRIGGER bloodgas_uuid BEFORE INSERT ON bloodgas
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS cage_uuid;
DELIMITER $$
CREATE TRIGGER cage_uuid BEFORE INSERT ON cage
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS cageclass_uuid;
DELIMITER $$
CREATE TRIGGER cageclass_uuid BEFORE INSERT ON cageclass
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS cagenotes_uuid;
DELIMITER $$
CREATE TRIGGER cagenotes_uuid BEFORE INSERT ON cagenotes
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS cases_uuid;
DELIMITER $$
CREATE TRIGGER cases_uuid BEFORE INSERT ON cases
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS chemisc_uuid;
DELIMITER $$
CREATE TRIGGER chemisc_uuid BEFORE INSERT ON chemisc
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS chemisc2_uuid;
DELIMITER $$
CREATE TRIGGER chemisc2_uuid BEFORE INSERT ON chemisc2
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS chemistry_uuid;
DELIMITER $$
CREATE TRIGGER chemistry_uuid BEFORE INSERT ON chemistry
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS chemnorm_uuid;
DELIMITER $$
CREATE TRIGGER chemnorm_uuid BEFORE INSERT ON chemnorm
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS clindrug_uuid;
DELIMITER $$
CREATE TRIGGER clindrug_uuid BEFORE INSERT ON clindrug
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS clinhead_uuid;
DELIMITER $$
CREATE TRIGGER clinhead_uuid BEFORE INSERT ON clinhead
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS clinpathmisc_uuid;
DELIMITER $$
CREATE TRIGGER clinpathmisc_uuid BEFORE INSERT ON clinpathmisc
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS clintrem_uuid;
DELIMITER $$
CREATE TRIGGER clintrem_uuid BEFORE INSERT ON clintrem
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS departure_uuid;
DELIMITER $$
CREATE TRIGGER departure_uuid BEFORE INSERT ON departure
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS electrolyte_uuid;
DELIMITER $$
CREATE TRIGGER electrolyte_uuid BEFORE INSERT ON electrolyte
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS electrophor_uuid;
DELIMITER $$
CREATE TRIGGER electrophor_uuid BEFORE INSERT ON electrophor
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS enzyme_uuid;
DELIMITER $$
CREATE TRIGGER enzyme_uuid BEFORE INSERT ON enzyme
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS files_uuid;
DELIMITER $$
CREATE TRIGGER files_uuid BEFORE INSERT ON files
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS gtt_uuid;
DELIMITER $$
CREATE TRIGGER gtt_uuid BEFORE INSERT ON gtt
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS hemamisc_uuid;
DELIMITER $$
CREATE TRIGGER hemamisc_uuid BEFORE INSERT ON hemamisc
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS hematology_uuid;
DELIMITER $$
CREATE TRIGGER hematology_uuid BEFORE INSERT ON hematology
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS holdcode_uuid;
DELIMITER $$
CREATE TRIGGER holdcode_uuid BEFORE INSERT ON holdcode
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS hormdrug_uuid;
DELIMITER $$
CREATE TRIGGER hormdrug_uuid BEFORE INSERT ON hormdrug
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS hormhead_uuid;
DELIMITER $$
CREATE TRIGGER hormhead_uuid BEFORE INSERT ON hormhead
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS hormtrem_uuid;
DELIMITER $$
CREATE TRIGGER hormtrem_uuid BEFORE INSERT ON hormtrem
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS housing_uuid;
DELIMITER $$
CREATE TRIGGER housing_uuid BEFORE INSERT ON housing
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS id_uuid;
DELIMITER $$
CREATE TRIGGER id_uuid BEFORE INSERT ON id
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS immunohead_uuid;
DELIMITER $$
CREATE TRIGGER immunohead_uuid BEFORE INSERT ON immunohead
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS immunores_uuid;
DELIMITER $$
CREATE TRIGGER immunores_uuid BEFORE INSERT ON immunores
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS labanimals_uuid;
DELIMITER $$
CREATE TRIGGER labanimals_uuid BEFORE INSERT ON labanimals
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS lapid_uuid;
DELIMITER $$
CREATE TRIGGER lapid_uuid BEFORE INSERT ON lapid
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS lipid_uuid;
DELIMITER $$
CREATE TRIGGER lipid_uuid BEFORE INSERT ON lipid
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS marmaux_uuid;
DELIMITER $$
CREATE TRIGGER marmaux_uuid BEFORE INSERT ON marmaux
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS mhctype_uuid;
DELIMITER $$
CREATE TRIGGER mhctype_uuid BEFORE INSERT ON mhctype
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS monitoranes_uuid;
DELIMITER $$
CREATE TRIGGER monitoranes_uuid BEFORE INSERT ON monitoranes
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS monitorfluid_uuid;
DELIMITER $$
CREATE TRIGGER monitorfluid_uuid BEFORE INSERT ON monitorfluid
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS monitorhead_uuid;
DELIMITER $$
CREATE TRIGGER monitorhead_uuid BEFORE INSERT ON monitorhead
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS monitormed_uuid;
DELIMITER $$
CREATE TRIGGER monitormed_uuid BEFORE INSERT ON monitormed
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS monitorsign_uuid;
DELIMITER $$
CREATE TRIGGER monitorsign_uuid BEFORE INSERT ON monitorsign
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS necropsydiag_uuid;
DELIMITER $$
CREATE TRIGGER necropsydiag_uuid BEFORE INSERT ON necropsydiag
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS necropsyhead_uuid;
DELIMITER $$
CREATE TRIGGER necropsyhead_uuid BEFORE INSERT ON necropsyhead
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS newsnomed_uuid;
DELIMITER $$
CREATE TRIGGER newsnomed_uuid BEFORE INSERT ON newsnomed
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS obs_uuid;
DELIMITER $$
CREATE TRIGGER obs_uuid BEFORE INSERT ON obs
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS parahead_uuid;
DELIMITER $$
CREATE TRIGGER parahead_uuid BEFORE INSERT ON parahead
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS parares_uuid;
DELIMITER $$
CREATE TRIGGER parares_uuid BEFORE INSERT ON parares
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS pedigree_uuid;
DELIMITER $$
CREATE TRIGGER pedigree_uuid BEFORE INSERT ON pedigree
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS perdiemrates_uuid;
DELIMITER $$
CREATE TRIGGER perdiemrates_uuid BEFORE INSERT ON perdiemrates
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS prenatal_uuid;
DELIMITER $$
CREATE TRIGGER prenatal_uuid BEFORE INSERT ON prenatal
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS project_uuid;
DELIMITER $$
CREATE TRIGGER project_uuid BEFORE INSERT ON project
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS protocol_uuid;
DELIMITER $$
CREATE TRIGGER protocol_uuid BEFORE INSERT ON protocol
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS ref_range_uuid;
DELIMITER $$
CREATE TRIGGER ref_range_uuid BEFORE INSERT ON ref_range
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS rhesaux_uuid;
DELIMITER $$
CREATE TRIGGER rhesaux_uuid BEFORE INSERT ON rhesaux
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS snomap_uuid;
DELIMITER $$
CREATE TRIGGER snomap_uuid BEFORE INSERT ON snomap
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS snomed_uuid;
DELIMITER $$
CREATE TRIGGER snomed_uuid BEFORE INSERT ON snomed
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS surganes_uuid;
DELIMITER $$
CREATE TRIGGER surganes_uuid BEFORE INSERT ON surganes
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS surgfluid_uuid;
DELIMITER $$
CREATE TRIGGER surgfluid_uuid BEFORE INSERT ON surgfluid
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS surghead_uuid;
DELIMITER $$
CREATE TRIGGER surghead_uuid BEFORE INSERT ON surghead
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS surgmed_uuid;
DELIMITER $$
CREATE TRIGGER surgmed_uuid BEFORE INSERT ON surgmed
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS surgpost_uuid;
DELIMITER $$
CREATE TRIGGER surgpost_uuid BEFORE INSERT ON surgpost
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS surgproc_uuid;
DELIMITER $$
CREATE TRIGGER surgproc_uuid BEFORE INSERT ON surgproc
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS surgsum_uuid;
DELIMITER $$
CREATE TRIGGER surgsum_uuid BEFORE INSERT ON surgsum
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS tb_uuid;
DELIMITER $$
CREATE TRIGGER tb_uuid BEFORE INSERT ON tb
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS tissue_uuid;
DELIMITER $$
CREATE TRIGGER tissue_uuid BEFORE INSERT ON tissue
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS treatments_uuid;
DELIMITER $$
CREATE TRIGGER treatments_uuid BEFORE INSERT ON treatments
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS urine_uuid;
DELIMITER $$
CREATE TRIGGER urine_uuid BEFORE INSERT ON urine
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS virisohead_uuid;
DELIMITER $$
CREATE TRIGGER virisohead_uuid BEFORE INSERT ON virisohead
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS virisores_uuid;
DELIMITER $$
CREATE TRIGGER virisores_uuid BEFORE INSERT ON virisores
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS virserohead_uuid;
DELIMITER $$
CREATE TRIGGER virserohead_uuid BEFORE INSERT ON virserohead
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS virserores_uuid;
DELIMITER $$
CREATE TRIGGER virserores_uuid BEFORE INSERT ON virserores
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS weight_uuid;
DELIMITER $$
CREATE TRIGGER weight_uuid BEFORE INSERT ON weight
	FOR EACH ROW BEGIN
	SET NEW.uuid = UUID();
	SET NEW.ts = now();
	END;$$ DELIMITER;

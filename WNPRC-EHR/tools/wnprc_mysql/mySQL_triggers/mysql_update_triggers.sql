/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
DROP TRIGGER IF EXISTS abstract_update;
DELIMITER $$
CREATE TRIGGER abstract_update BEFORE UPDATE ON abstract
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS arrival_update;
DELIMITER $$
CREATE TRIGGER arrival_update BEFORE UPDATE ON arrival
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS assignment_update;
DELIMITER $$
CREATE TRIGGER assignment_update BEFORE UPDATE ON assignment
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS bacteriology_update;
DELIMITER $$
CREATE TRIGGER bacteriology_update BEFORE UPDATE ON bacteriology
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS behavedrug_update;
DELIMITER $$
CREATE TRIGGER behavedrug_update BEFORE UPDATE ON behavedrug
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS behavehead_update;
DELIMITER $$
CREATE TRIGGER behavehead_update BEFORE UPDATE ON behavehead
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS behavetrem_update;
DELIMITER $$
CREATE TRIGGER behavetrem_update BEFORE UPDATE ON behavetrem
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS biopsydiag_update;
DELIMITER $$
CREATE TRIGGER biopsydiag_update BEFORE UPDATE ON biopsydiag
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS biopsyhead_update;
DELIMITER $$
CREATE TRIGGER biopsyhead_update BEFORE UPDATE ON biopsyhead
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS birth_update;
DELIMITER $$
CREATE TRIGGER birth_update BEFORE UPDATE ON birth
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS blood_update;
DELIMITER $$
CREATE TRIGGER blood_update BEFORE UPDATE ON blood
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS bloodgas_update;
DELIMITER $$
CREATE TRIGGER bloodgas_update BEFORE UPDATE ON bloodgas
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS cage_update;
DELIMITER $$
CREATE TRIGGER cage_update BEFORE UPDATE ON cage
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS cageclass_update;
DELIMITER $$
CREATE TRIGGER cageclass_update BEFORE UPDATE ON cageclass
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS cagenotes_update;
DELIMITER $$
CREATE TRIGGER cagenotes_update BEFORE UPDATE ON cagenotes
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS cases_update;
DELIMITER $$
CREATE TRIGGER cases_update BEFORE UPDATE ON cases
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS chemisc_update;
DELIMITER $$
CREATE TRIGGER chemisc_update BEFORE UPDATE ON chemisc
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS chemisc2_update;
DELIMITER $$
CREATE TRIGGER chemisc2_update BEFORE UPDATE ON chemisc2
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS chemistry_update;
DELIMITER $$
CREATE TRIGGER chemistry_update BEFORE UPDATE ON chemistry
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS chemnorm_update;
DELIMITER $$
CREATE TRIGGER chemnorm_update BEFORE UPDATE ON chemnorm
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS clindrug_update;
DELIMITER $$
CREATE TRIGGER clindrug_update BEFORE UPDATE ON clindrug
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS clinhead_update;
DELIMITER $$
CREATE TRIGGER clinhead_update BEFORE UPDATE ON clinhead
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS clinpathmisc_update;
DELIMITER $$
CREATE TRIGGER clinpathmisc_update BEFORE UPDATE ON clinpathmisc
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS clintrem_update;
DELIMITER $$
CREATE TRIGGER clintrem_update BEFORE UPDATE ON clintrem
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS departure_update;
DELIMITER $$
CREATE TRIGGER departure_update BEFORE UPDATE ON departure
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS electrolyte_update;
DELIMITER $$
CREATE TRIGGER electrolyte_update BEFORE UPDATE ON electrolyte
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS electrophor_update;
DELIMITER $$
CREATE TRIGGER electrophor_update BEFORE UPDATE ON electrophor
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS enzyme_update;
DELIMITER $$
CREATE TRIGGER enzyme_update BEFORE UPDATE ON enzyme
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS files_update;
DELIMITER $$
CREATE TRIGGER files_update BEFORE UPDATE ON files
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS gtt_update;
DELIMITER $$
CREATE TRIGGER gtt_update BEFORE UPDATE ON gtt
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS hemamisc_update;
DELIMITER $$
CREATE TRIGGER hemamisc_update BEFORE UPDATE ON hemamisc
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS hematology_update;
DELIMITER $$
CREATE TRIGGER hematology_update BEFORE UPDATE ON hematology
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS holdcode_update;
DELIMITER $$
CREATE TRIGGER holdcode_update BEFORE UPDATE ON holdcode
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS hormdrug_update;
DELIMITER $$
CREATE TRIGGER hormdrug_update BEFORE UPDATE ON hormdrug
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS hormhead_update;
DELIMITER $$
CREATE TRIGGER hormhead_update BEFORE UPDATE ON hormhead
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS hormtrem_update;
DELIMITER $$
CREATE TRIGGER hormtrem_update BEFORE UPDATE ON hormtrem
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS housing_update;
DELIMITER $$
CREATE TRIGGER housing_update BEFORE UPDATE ON housing
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS id_update;
DELIMITER $$
CREATE TRIGGER id_update BEFORE UPDATE ON id
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS immunohead_update;
DELIMITER $$
CREATE TRIGGER immunohead_update BEFORE UPDATE ON immunohead
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS immunores_update;
DELIMITER $$
CREATE TRIGGER immunores_update BEFORE UPDATE ON immunores
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS labanimals_update;
DELIMITER $$
CREATE TRIGGER labanimals_update BEFORE UPDATE ON labanimals
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS lapid_update;
DELIMITER $$
CREATE TRIGGER lapid_update BEFORE UPDATE ON lapid
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS lipid_update;
DELIMITER $$
CREATE TRIGGER lipid_update BEFORE UPDATE ON lipid
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS marmaux_update;
DELIMITER $$
CREATE TRIGGER marmaux_update BEFORE UPDATE ON marmaux
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS mhctype_update;
DELIMITER $$
CREATE TRIGGER mhctype_update BEFORE UPDATE ON mhctype
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS monitoranes_update;
DELIMITER $$
CREATE TRIGGER monitoranes_update BEFORE UPDATE ON monitoranes
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS monitorfluid_update;
DELIMITER $$
CREATE TRIGGER monitorfluid_update BEFORE UPDATE ON monitorfluid
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS monitorhead_update;
DELIMITER $$
CREATE TRIGGER monitorhead_update BEFORE UPDATE ON monitorhead
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS monitormed_update;
DELIMITER $$
CREATE TRIGGER monitormed_update BEFORE UPDATE ON monitormed
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS monitorsign_update;
DELIMITER $$
CREATE TRIGGER monitorsign_update BEFORE UPDATE ON monitorsign
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS necropsydiag_update;
DELIMITER $$
CREATE TRIGGER necropsydiag_update BEFORE UPDATE ON necropsydiag
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS necropsyhead_update;
DELIMITER $$
CREATE TRIGGER necropsyhead_update BEFORE UPDATE ON necropsyhead
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS newsnomed_update;
DELIMITER $$
CREATE TRIGGER newsnomed_update BEFORE UPDATE ON newsnomed
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS obs_update;
DELIMITER $$
CREATE TRIGGER obs_update BEFORE UPDATE ON obs
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS parahead_update;
DELIMITER $$
CREATE TRIGGER parahead_update BEFORE UPDATE ON parahead
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS parares_update;
DELIMITER $$
CREATE TRIGGER parares_update BEFORE UPDATE ON parares
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS pedigree_update;
DELIMITER $$
CREATE TRIGGER pedigree_update BEFORE UPDATE ON pedigree
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS perdiemrates_update;
DELIMITER $$
CREATE TRIGGER perdiemrates_update BEFORE UPDATE ON perdiemrates
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS prenatal_update;
DELIMITER $$
CREATE TRIGGER prenatal_update BEFORE UPDATE ON prenatal
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS project_update;
DELIMITER $$
CREATE TRIGGER project_update BEFORE UPDATE ON project
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS protocol_update;
DELIMITER $$
CREATE TRIGGER protocol_update BEFORE UPDATE ON protocol
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS ref_range_update;
DELIMITER $$
CREATE TRIGGER ref_range_update BEFORE UPDATE ON ref_range
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS rhesaux_update;
DELIMITER $$
CREATE TRIGGER rhesaux_update BEFORE UPDATE ON rhesaux
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS snomap_update;
DELIMITER $$
CREATE TRIGGER snomap_update BEFORE UPDATE ON snomap
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS snomed_update;
DELIMITER $$
CREATE TRIGGER snomed_update BEFORE UPDATE ON snomed
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS surganes_update;
DELIMITER $$
CREATE TRIGGER surganes_update BEFORE UPDATE ON surganes
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS surgfluid_update;
DELIMITER $$
CREATE TRIGGER surgfluid_update BEFORE UPDATE ON surgfluid
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS surghead_update;
DELIMITER $$
CREATE TRIGGER surghead_update BEFORE UPDATE ON surghead
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS surgmed_update;
DELIMITER $$
CREATE TRIGGER surgmed_update BEFORE UPDATE ON surgmed
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS surgpost_update;
DELIMITER $$
CREATE TRIGGER surgpost_update BEFORE UPDATE ON surgpost
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS surgproc_update;
DELIMITER $$
CREATE TRIGGER surgproc_update BEFORE UPDATE ON surgproc
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS surgsum_update;
DELIMITER $$
CREATE TRIGGER surgsum_update BEFORE UPDATE ON surgsum
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS tb_update;
DELIMITER $$
CREATE TRIGGER tb_update BEFORE UPDATE ON tb
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS tissue_update;
DELIMITER $$
CREATE TRIGGER tissue_update BEFORE UPDATE ON tissue
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS treatments_update;
DELIMITER $$
CREATE TRIGGER treatments_update BEFORE UPDATE ON treatments
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS urine_update;
DELIMITER $$
CREATE TRIGGER urine_update BEFORE UPDATE ON urine
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS virisohead_update;
DELIMITER $$
CREATE TRIGGER virisohead_update BEFORE UPDATE ON virisohead
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS virisores_update;
DELIMITER $$
CREATE TRIGGER virisores_update BEFORE UPDATE ON virisores
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS virserohead_update;
DELIMITER $$
CREATE TRIGGER virserohead_update BEFORE UPDATE ON virserohead
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS virserores_update;
DELIMITER $$
CREATE TRIGGER virserores_update BEFORE UPDATE ON virserores
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;
DROP TRIGGER IF EXISTS weight_update;
DELIMITER $$
CREATE TRIGGER weight_update BEFORE UPDATE ON weight
	FOR EACH ROW BEGIN
	SET NEW.ts = now();
	END;$$ DELIMITER;

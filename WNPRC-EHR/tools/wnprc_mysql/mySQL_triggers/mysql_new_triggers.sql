/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
DROP TRIGGER IF EXISTS surghead_delete;
delimiter $$
CREATE TRIGGER surghead_delete BEFORE DELETE ON surghead
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'surghead', 'surgery', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'surghead', 'encounters', 'dataset');
END
;
$$ DELIMITER ;

DROP TRIGGER IF EXISTS necropsyhead_delete;
delimiter $$
CREATE TRIGGER necropsyhead_delete BEFORE DELETE ON necropsyhead
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'necropsyhead', 'necropsy', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'necropsyhead', 'encounters', 'dataset');
END
;
$$ DELIMITER ;

DROP TRIGGER IF EXISTS biopsyhead_delete;
delimiter $$
CREATE TRIGGER biopsyhead_delete BEFORE DELETE ON biopsyhead
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'biopsyhead', 'biopsy', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'biopsyhead', 'encounters', 'dataset');
END
;
$$ DELIMITER ;


DROP TRIGGER IF EXISTS bacteriology_delete;
delimiter $$
CREATE TRIGGER bacteriology_delete BEFORE DELETE ON bacteriology
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'bacteriology', 'bacteriologyRuns', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'bacteriology', 'bacteriologyResults', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'bacteriology', 'clinpathRuns', 'dataset');
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

DROP TRIGGER IF EXISTS hematology_delete;
delimiter $$
CREATE TRIGGER hematology_delete BEFORE DELETE ON hematology
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'hematology', 'hematologyRuns', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'hematology', 'hematologyResults', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'hematology', 'clinpathRuns', 'dataset');
END
;$$ DELIMITER ;

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

DROP TRIGGER IF EXISTS parahead_delete;
delimiter $$
CREATE TRIGGER parahead_delete BEFORE DELETE ON parahead
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'parahead', 'parasitologyRuns', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'parahead', 'clinpathRuns', 'dataset');
END
;$$ DELIMITER ;

DROP TRIGGER IF EXISTS urine_delete;
delimiter $$
CREATE TRIGGER urine_delete BEFORE DELETE ON urine
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'urine', 'urinalysisRuns', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'urine', 'urinalysisResults', 'dataset');
END
;$$ DELIMITER ;

DROP TRIGGER IF EXISTS virisohead_delete;
CREATE TRIGGER virisohead_delete BEFORE DELETE ON virisohead
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'virisohead', 'virologyRuns', 'dataset')
;

DROP TRIGGER IF EXISTS virserohead_delete;
CREATE TRIGGER virserohead_delete BEFORE DELETE ON virserohead
FOR EACH ROW
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'virserohead', 'virologyRuns', 'dataset')
;


DROP TRIGGER IF EXISTS abstract_delete;
delimiter $$
CREATE TRIGGER abstract_delete BEFORE DELETE ON abstract
FOR EACH ROW
BEGIN
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'abstract', 'demographics', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'abstract', 'alerts', 'dataset');
insert into colony.deleted_records (uuid, orig_id, tableName, labkeyTable, type) values (OLD.uuid, OLD.id, 'abstract', 'deaths', 'dataset');
END

$$ DELIMITER ;
/*
 * Copyright (c) 2011-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


/* EHR_Lookups-11.21-11.22.sql */

DROP TABLE IF EXISTS ehr_lookups.restraint_duration;
CREATE TABLE ehr_lookups.restraint_duration (
duration varchar(200),
sort_order integer,

CONSTRAINT PK_restraint_duration PRIMARY KEY (duration)
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of obs_remarks
-- ----------------------------
INSERT INTO ehr_lookups.restraint_duration (duration, sort_order)
VALUES
('<30 min', 1),
('30-59 min', 2),
('1-12 hours', 3),
('>12 hours', 4)
;

/* EHR_Lookups-11.22-11.23.sql */

alter table ehr_lookups.chemistry_tests
  add column aliases varchar(500)
  ;

UPDATE ehr_lookups.chemistry_tests set aliases = 'GLU' WHERE testid = 'GLUC';
UPDATE ehr_lookups.chemistry_tests set aliases = 'CR' WHERE testid = 'CREAT';
UPDATE ehr_lookups.chemistry_tests set aliases = 'CHO' WHERE testid = 'CHOL';
UPDATE ehr_lookups.chemistry_tests set aliases = 'TRG' WHERE testid = 'TRIG';
UPDATE ehr_lookups.chemistry_tests set aliases = 'AST' WHERE testid = 'SGOT';
UPDATE ehr_lookups.chemistry_tests set aliases = 'BIL' WHERE testid = 'TB';
UPDATE ehr_lookups.chemistry_tests set aliases = 'ALT' WHERE testid = 'SGPT';
UPDATE ehr_lookups.chemistry_tests set aliases = 'ALP' WHERE testid = 'ALKP';
UPDATE ehr_lookups.chemistry_tests set aliases = 'PHO' WHERE testid = 'PHOS';

/* EHR_Lookups-11.23-11.24.sql */

DROP TABLE IF EXISTS ehr_lookups.drug_categories;
CREATE TABLE ehr_lookups.drug_categories (
category varchar(200),

CONSTRAINT PK_drug_categories PRIMARY KEY (category)
)
WITH (OIDS=FALSE)

;

INSERT INTO ehr_lookups.drug_categories
(category) VALUES
('Treatments'),
('Surgery Medication'),
('Surgery Anesthesia'),
('Procedure'),
('Surgery Fluid'),
('Hormone'),
('Drug')
;


alter table ehr_lookups.condition_codes
  add column min integer,
  add column max integer
  ;


DELETE FROM ehr_lookups.condition_codes;

INSERT INTO ehr_lookups.condition_codes
(code, meaning, min, max) VALUES
('am', 'with adopted mother', 2, null),
('b', 'breeding', 2, null),
('c', 'chair', 1, 1),
('f', 'with the father', 2, null),
('g', 'in a group (+3 animals living together)', 3, null),
('gam', 'in a group with adopted mother', 3, null),
('gf', 'in a group with father', 3, null),
('gm', 'in a group with the mother', 3, null),
('gmf', 'in a group with the mother and father', 3, null),
('m', 'with the mother', 2, null),
('p', 'paired', 2, null),
('pc', 'protected contact paired', 1, null),
('s', 'single', 1, 1),
('x', 'special housing condition', 1, 1),
('gaf', 'in a group with adopted father', 3, null),
('mgaf', 'in a group with mother and adopted father', 3, null),
('gb', 'group breeding', 3, null),
('gmaf', 'in a group with the mother and adopted father', 3, null),
('xs', 'special housing from single', 1, 1)
;



DROP TABLE IF EXISTS ehr_lookups.usda_codes;
CREATE TABLE ehr_lookups.usda_codes (
rowid serial not null,
code varchar(100),
category varchar(100),
usda_letter varchar(10),
include_previous bool default false,

CONSTRAINT PK_usda_codes PRIMARY KEY (rowid)
)
WITH (OIDS=FALSE)

;


DROP TABLE IF EXISTS ehr_lookups.full_snomed;
CREATE TABLE ehr_lookups.full_snomed (
code varchar(255) NOT NULL,
meaning varchar(2000),

-- Container ENTITYID,
CreatedBy USERID NOT NULL,
Created TIMESTAMP NOT NULL,
ModifiedBy USERID NOT NULL,
Modified TIMESTAMP NOT NULL,

CONSTRAINT PK_full_snomed PRIMARY KEY (code)
)
WITH (OIDS=FALSE)

;


DROP TABLE IF EXISTS ehr_lookups.snomap;
CREATE TABLE ehr_lookups.snomap (
rowid serial not null,
ocode varchar(255) NOT NULL,
ncode varchar(255) NOT NULL,
meaning varchar(2000),
date timestamp,
objectid ENTITYID NOT NULL,

CreatedBy USERID NOT NULL,
Created TIMESTAMP NOT NULL,
ModifiedBy USERID NOT NULL,
Modified TIMESTAMP NOT NULL,

CONSTRAINT PK_snomap PRIMARY KEY (rowid)
)
WITH (OIDS=FALSE)

;


DROP TABLE IF EXISTS ehr_lookups.chow_types;
CREATE TABLE ehr_lookups.chow_types (
type varchar(200),

CONSTRAINT PK_chow_types PRIMARY KEY (type)
)
WITH (OIDS=FALSE)

;


DELETE FROM ehr_lookups.snomed_qualifiers where qualifier in (
'right cranial lobe',
'right middle lobe',
'right caudal lobe',
'left cranial lobe',
'left middle lobe',
'left caudal lobe',
'accessory lobe'
);

INSERT into ehr_lookups.snomed_qualifiers (qualifier) VALUES
('right cranial lobe'),
('right middle lobe'),
('right caudal lobe'),
('left cranial lobe'),
('left middle lobe'),
('left caudal lobe'),
('accessory lobe')
;





alter table ehr_lookups.clinpath_tests
  add column alertOnAbnormal bool default false,
  add column alertOnComplete bool default false
;

/* EHR_Lookups-11.24-11.25.sql */

alter table ehr_lookups.hematology_tests
  add column sort_order integer
;


DROP TABLE IF EXISTS ehr_lookups.tissue_distribution;
CREATE TABLE ehr_lookups.tissue_distribution (
location varchar(100),

CONSTRAINT PK_tissue_distribution PRIMARY KEY (location)
)
WITH (OIDS=FALSE)

;

INSERT INTO ehr_lookups.tissue_distribution
(location) VALUES
('NHPBMD'),
('NIA Tissue Bank')
;


INSERT INTO ehr_lookups.snomed_qualifiers
(qualifier) VALUES
('rostral'),
('caudal'),
('upper'),
('lower'),
('cranial'),
('lateral'),
('descending'),
('ascending'),
('portion'),
('head'),
('tail'),
('endo'),
('exo'),
('anterior'),
('posterior')
;

delete from ehr_lookups.death_manner where manner = 'Other';

insert into ehr_lookups.death_manner (manner) values ('Died in utero');

insert into ehr_lookups.preservation_solutions
(solution) values
('0.9% saline')
;


DROP TABLE IF EXISTS ehr_lookups.container_types;
CREATE TABLE ehr_lookups.container_types (
type varchar(100),

CONSTRAINT PK_container_types PRIMARY KEY (type)
)
WITH (OIDS=FALSE)

;

INSERT INTO ehr_lookups.container_types
(type) VALUES
('Cryotube'),
('15ml Conical Tube'),
('50ml Conical Tube')
;

update ehr_lookups.hematology_tests set sort_order = 1 where testid = 'WBC';
update ehr_lookups.hematology_tests set sort_order = 2 where testid = 'RBC';
update ehr_lookups.hematology_tests set sort_order = 3 where testid = 'HGB';
update ehr_lookups.hematology_tests set sort_order = 4 where testid = 'HCT';
update ehr_lookups.hematology_tests set sort_order = 5 where testid = 'MCV';
update ehr_lookups.hematology_tests set sort_order = 6 where testid = 'MCH';
update ehr_lookups.hematology_tests set sort_order = 7 where testid = 'MCHC';
update ehr_lookups.hematology_tests set sort_order = 8 where testid = 'RDW';
update ehr_lookups.hematology_tests set sort_order = 9 where testid = 'PLT';
update ehr_lookups.hematology_tests set sort_order = 10 where testid = 'MPV';
update ehr_lookups.hematology_tests set sort_order = 11 where testid = 'PCV';
update ehr_lookups.hematology_tests set sort_order = 12 where testid = 'NE';
update ehr_lookups.hematology_tests set sort_order = 13 where testid = 'LY';
update ehr_lookups.hematology_tests set sort_order = 14 where testid = 'MN';
update ehr_lookups.hematology_tests set sort_order = 15 where testid = 'EO';
update ehr_lookups.hematology_tests set sort_order = 16 where testid = 'BS';
update ehr_lookups.hematology_tests set sort_order = 17 where testid = 'BANDS';
update ehr_lookups.hematology_tests set sort_order = 18 where testid = 'METAMYELO';
update ehr_lookups.hematology_tests set sort_order = 19 where testid = 'MYELO';
update ehr_lookups.hematology_tests set sort_order = 20 where testid = 'TP';
update ehr_lookups.hematology_tests set sort_order = 21 where testid = 'RETICULO';
update ehr_lookups.hematology_tests set sort_order = 22 where testid = 'PRO MYELO';
update ehr_lookups.hematology_tests set sort_order = 23 where testid = 'ATYL LYMPH';
update ehr_lookups.hematology_tests set sort_order = 24 where testid = 'OTHER';

/* EHR_Lookups-11.27-11.28.sql */

DELETE FROM ehr_lookups.snomed_qualifiers where qualifier in (
'right cranial lobe',
'right middle lobe',
'right caudal lobe',
'left cranial lobe',
'left middle lobe',
'left caudal lobe',
'accessory lobe'
);

INSERT into ehr_lookups.snomed_qualifiers (qualifier) VALUES
('right cranial lobe'),
('right middle lobe'),
('right caudal lobe'),
('left cranial lobe'),
('left middle lobe'),
('left caudal lobe'),
('accessory lobe')
;


--drop/recreate table
DROP TABLE IF EXISTS ehr_lookups.clinpath_tests;
CREATE TABLE ehr_lookups.clinpath_tests (
testName varchar(255) NOT NULL,
units varchar(20),
dataset varchar(200),

CONSTRAINT PK_testName PRIMARY KEY (testname)
)
WITH (OIDS=FALSE)

;


INSERT INTO ehr_lookups.clinpath_tests
(testname, dataset) VALUES
('ELISA - HBV', 'Virology'),
('ELISA - SRV', 'Virology'),
('ELISA - SIV', 'Virology'),
('ELISA - STLV-1', 'Virology'),
('ELISA - Measles', 'Virology'),
('PCR - STLV-1', 'Virology'),
('PCR - SRV 1,2,3,4,5', 'Virology'),
('Isolation - HBV', 'Virology'),
('CBC', 'Hematology'),
('Glycosylated Hemoglobin', 'Hematology'),
('Vet-19 Chem Panel', 'Chemistry'),
('Lipid Panel', 'Chemistry'),
('Prothrombin Time (PT) and Activated Partial Thromboplastin Time (APTT)', 'Chemistry'),
('Ova and Parasite Antigen Panel (EIA)', 'Parasitology'),
('Ova and Parasite Concentration (Fecal Float)', 'Parasitology'),
('Ova and Parasite Wet Prep', 'Parasitology'),
('Direct Smear for Protozoa', 'Parasitology'),
('Culture, Enteric', 'Bacteriology'),
('Culture, Bacterial/Smear', 'Bacteriology'),
('Culture, Fungus, Dermal/Smear', 'Bacteriology'),
('Culture, Sterile Fluid/Tissue/Smear', 'Bacteriology'),
('Culture, Urine', 'Bacteriology'),
('Culture, Wound/Smear', 'Bacteriology'),
('Culture, Other', 'Bacteriology'),
('Chlamydia trachomatis Detection by NAA', 'Bacteriology'),
('GIFN for TB detection', 'Bacteriology'),
('Occult Blood', 'Parasitology'),
('Mycobacteria Smear and Culture', 'Bacteriology'),
('PCR - Individual Bacterium', 'Bacteriology'),
('Chol/HDL Ratio', 'Chemistry'),
('Osmolarity', 'Chemistry')
;

alter table ehr_lookups.clinpath_tests
  add column alertOnAbnormal bool default false,
  add column alertOnComplete bool default false
;



--



alter table ehr_lookups.lab_tests
  add column alertOnAbnormal bool default true,
  add column categories varchar(200),
  add column sort_order integer
;



alter table ehr_lookups.clinpath_tests
  drop column alertOnAbnormal
;


alter table ehr_lookups.usda_codes
  add column keyword varchar(255)
;


alter table ehr_lookups.chemistry_tests
  add column alertOnAbnormal bool default true,
  add column alertOnAny bool default false,
  add column includeInPanel bool default false,
  add column sort_order integer
;

alter table ehr_lookups.hematology_tests
  add column alertOnAbnormal bool default true,
  add column alertOnAny bool default false,
  add column includeInPanel bool default false
  --add column sort_order integer
;

alter table ehr_lookups.immunology_tests
  add column alertOnAbnormal bool default true,
  add column alertOnAny bool default false,
  add column includeInPanel bool default false,
  add column sort_order integer
;

alter table ehr_lookups.urinalysis_tests
  add column alertOnAbnormal bool default true,
  add column alertOnAny bool default false,
  add column includeInPanel bool default false,
  add column sort_order integer
;

alter table ehr_lookups.virology_tests
  add column alertOnAbnormal bool default true,
  add column alertOnAny bool default false,
  add column includeInPanel bool default false,
  add column sort_order integer
;


update ehr_lookups.hematology_tests set sort_order = 1, includeInPanel=true where testid = 'WBC';
update ehr_lookups.hematology_tests set sort_order = 2, includeInPanel=true where testid = 'RBC';
update ehr_lookups.hematology_tests set sort_order = 3, includeInPanel=true where testid = 'HGB';
update ehr_lookups.hematology_tests set sort_order = 4, includeInPanel=true where testid = 'HCT';
update ehr_lookups.hematology_tests set sort_order = 5, includeInPanel=true where testid = 'MCV';
update ehr_lookups.hematology_tests set sort_order = 6, includeInPanel=true where testid = 'MCH';
update ehr_lookups.hematology_tests set sort_order = 7, includeInPanel=true where testid = 'MCHC';
update ehr_lookups.hematology_tests set sort_order = 8, includeInPanel=true where testid = 'RDW';
update ehr_lookups.hematology_tests set sort_order = 9, includeInPanel=true where testid = 'PLT';
update ehr_lookups.hematology_tests set sort_order = 10, includeInPanel=true where testid = 'MPV';
update ehr_lookups.hematology_tests set sort_order = 11, includeInPanel=true where testid = 'PCV';
update ehr_lookups.hematology_tests set sort_order = 12, includeInPanel=true where testid = 'NE';
update ehr_lookups.hematology_tests set sort_order = 13, includeInPanel=true where testid = 'LY';
update ehr_lookups.hematology_tests set sort_order = 14, includeInPanel=true where testid = 'MN';
update ehr_lookups.hematology_tests set sort_order = 15, includeInPanel=true where testid = 'EO';
update ehr_lookups.hematology_tests set sort_order = 16, includeInPanel=true where testid = 'BS';
update ehr_lookups.hematology_tests set sort_order = 17, includeInPanel=true where testid = 'BANDS';
update ehr_lookups.hematology_tests set sort_order = 18, includeInPanel=true where testid = 'METAMYELO';
update ehr_lookups.hematology_tests set sort_order = 19, includeInPanel=true where testid = 'MYELO';
update ehr_lookups.hematology_tests set sort_order = 20, includeInPanel=true where testid = 'TP';
update ehr_lookups.hematology_tests set sort_order = 21, includeInPanel=true where testid = 'RETICULO';
update ehr_lookups.hematology_tests set sort_order = 22, includeInPanel=true where testid = 'PRO MYELO';
update ehr_lookups.hematology_tests set sort_order = 23, includeInPanel=true where testid = 'ATYL LYMPH';
update ehr_lookups.hematology_tests set sort_order = 24, includeInPanel=true where testid = 'OTHER';


update ehr_lookups.chemistry_tests set sort_order = 1, includeInPanel=true where testid = 'GLUC';
update ehr_lookups.chemistry_tests set sort_order = 2, includeInPanel=true where testid = 'BUN';
update ehr_lookups.chemistry_tests set sort_order = 3, includeInPanel=true where testid = 'CREAT';
update ehr_lookups.chemistry_tests set sort_order = 4, includeInPanel=true where testid = 'CPK';
update ehr_lookups.chemistry_tests set sort_order = 5, includeInPanel=true where testid = 'CHOL';
update ehr_lookups.chemistry_tests set sort_order = 6, includeInPanel=true where testid = 'TRIG';
update ehr_lookups.chemistry_tests set sort_order = 7, includeInPanel=true where testid = 'SGOT';
update ehr_lookups.chemistry_tests set sort_order = 8, includeInPanel=true where testid = 'LDL';
update ehr_lookups.chemistry_tests set sort_order = 9, includeInPanel=true where testid = 'LDH';
update ehr_lookups.chemistry_tests set sort_order = 10, includeInPanel=true where testid = 'TB';
update ehr_lookups.chemistry_tests set sort_order = 11, includeInPanel=true where testid = 'GGT';
update ehr_lookups.chemistry_tests set sort_order = 12, includeInPanel=true where testid = 'SGPT';
update ehr_lookups.chemistry_tests set sort_order = 13, includeInPanel=true where testid = 'TP';
update ehr_lookups.chemistry_tests set sort_order = 14, includeInPanel=true where testid = 'ALB';
update ehr_lookups.chemistry_tests set sort_order = 15, includeInPanel=true where testid = 'ALKP';
update ehr_lookups.chemistry_tests set sort_order = 16, includeInPanel=true where testid = 'CA';
update ehr_lookups.chemistry_tests set sort_order = 17, includeInPanel=true where testid = 'PHOS';
update ehr_lookups.chemistry_tests set sort_order = 18, includeInPanel=true where testid = 'FE';
update ehr_lookups.chemistry_tests set sort_order = 19, includeInPanel=true where testid = 'NA';
update ehr_lookups.chemistry_tests set sort_order = 20, includeInPanel=true where testid = 'K';
update ehr_lookups.chemistry_tests set sort_order = 21, includeInPanel=true where testid = 'L';
update ehr_lookups.chemistry_tests set sort_order = 22, includeInPanel=true where testid = 'UA';

update ehr_lookups.immunology_tests set sort_order = 1, includeInPanel=true where testid = 'CD3';
update ehr_lookups.immunology_tests set sort_order = 2, includeInPanel=true where testid = 'CD20';
update ehr_lookups.immunology_tests set sort_order = 3, includeInPanel=true where testid = 'CD4';
update ehr_lookups.immunology_tests set sort_order = 4, includeInPanel=true where testid = 'CD8';

update ehr_lookups.urinalysis_tests set sort_order = 1, includeInPanel=true where testid = 'BILIRUBIN';
update ehr_lookups.urinalysis_tests set sort_order = 2, includeInPanel=true where testid = 'KETONE';
update ehr_lookups.urinalysis_tests set sort_order = 3, includeInPanel=true where testid = 'SP_GRAVITY';
update ehr_lookups.urinalysis_tests set sort_order = 4, includeInPanel=true where testid = 'BLOOD';
update ehr_lookups.urinalysis_tests set sort_order = 5, includeInPanel=true where testid = 'PH';
update ehr_lookups.urinalysis_tests set sort_order = 6, includeInPanel=true where testid = 'PROTEIN';
update ehr_lookups.urinalysis_tests set sort_order = 7, includeInPanel=true where testid = 'UROBILINOGEN';
update ehr_lookups.urinalysis_tests set sort_order = 8, includeInPanel=true where testid = 'NITRITE';
update ehr_lookups.urinalysis_tests set sort_order = 9, includeInPanel=true where testid = 'LEUKOCYTES';
update ehr_lookups.urinalysis_tests set sort_order = 10, includeInPanel=true where testid = 'APPEARANCE';
update ehr_lookups.urinalysis_tests set sort_order = 11, includeInPanel=true where testid = 'MICROSCOPIC';
update ehr_lookups.urinalysis_tests set sort_order = 12, includeInPanel=true where testid = 'GLUCOSE';





drop table if exists ehr_lookups.lab_tests;

/* EHR_Lookups-11.29-11.291.sql */

alter table ehr_lookups.lab_test_range
  add column type varchar(200)
;

update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'ALB';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'ALKP';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'BUN';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'CA';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'CHOL';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'CL';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'CPK';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'CREAT';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'FE';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'GGT';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'GLUC';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'HCT';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'HGB';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'K';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'LDH';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'MCH';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'MCHC';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'MCV';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'MPV';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'NA';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'PHOS';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'PLT';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'RBC';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'RDW';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'SGOT';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'SGPT';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'TB';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'TP';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'TRIG';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'UA';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'WBC';

/* EHR_Lookups-11.291-11.292.sql */

delete from ehr.notificationtypes where notificationtype = 'Animal Death';
insert into ehr.notificationtypes
(notificationtype,description) VALUES
('Animal Death', 'An email will be sent each time an animal is marked as dead')
;


-- ----------------------------
-- Table structure for ehr_lookups.death_remarks
-- ----------------------------
DROP TABLE IF EXISTS ehr_lookups.death_remarks;
CREATE TABLE ehr_lookups.death_remarks (
title varchar(100),
remark varchar(500),

CONSTRAINT PK_death_remarks PRIMARY KEY (title)
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of obs_remarks
-- ----------------------------
INSERT INTO ehr_lookups.death_remarks (title, remark)
VALUES
('Euthanasia', 'Monkey was euthanized and submitted for pathological examination'),
('Found dead', 'Monkey was found dead and submitted for pathological examination'),
('Died during medical treatment', 'Monkey died during clinical procedure and was submitted for pathological examination'),
('Died during experimental procedure', 'Monkey died during experimental procedure and was submitted for pathological examination')
;



-- ----------------------------
-- Table structure for ehr_lookups.obs_remarks
-- ----------------------------
DROP TABLE IF EXISTS ehr_lookups.obs_remarks;
CREATE TABLE ehr_lookups.obs_remarks (
title varchar NOT NULL,
remark varchar,

CONSTRAINT PK_obs_remarks PRIMARY KEY (title)
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of obs_remarks
-- ----------------------------
INSERT INTO ehr_lookups.obs_remarks VALUES ('healing', 'healing');
INSERT INTO ehr_lookups.obs_remarks VALUES ('some FS', 'some FS');
INSERT INTO ehr_lookups.obs_remarks VALUES ('ok', 'ok');
INSERT INTO ehr_lookups.obs_remarks VALUES ('stool ok', 'stool ok');
INSERT INTO ehr_lookups.obs_remarks VALUES ('4 clo', '4 clo');
INSERT INTO ehr_lookups.obs_remarks VALUES ('small FS', 'small FS');
INSERT INTO ehr_lookups.obs_remarks VALUES ('5 clo', '5 clo');
INSERT INTO ehr_lookups.obs_remarks VALUES ('runny nose', 'runny nose');
INSERT INTO ehr_lookups.obs_remarks VALUES ('6 clo', '6 clo');
INSERT INTO ehr_lookups.obs_remarks VALUES ('3 clo', '3 clo');

/* EHR_Lookups-11.292-11.293.sql */

--NOTE: Fix for test failure after improperly editing EHR_lookups-11.2-11.21

-- ----------------------------
-- Table structure for ehr_lookups.routes
-- ----------------------------
DROP TABLE IF EXISTS ehr_lookups.routes;
CREATE TABLE ehr_lookups.routes (
route varchar(100) NOT NULL,
meaning varchar(200),

CONSTRAINT PK_routes PRIMARY KEY (route)
)
WITH (OIDS=FALSE)

;


-- ----------------------------
-- Records of routes
-- ----------------------------
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('IM', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('IT', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('IV', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('IVAG', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('oral', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('rectal', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('SQ', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('topical (eye)', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('topical (skin)', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('topical', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('intracardiac', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('intracarotid', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('intracorneal',	'Intracorneal');
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('intracranial', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('IP', 'intraperitoneal');
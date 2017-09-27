/*
 * Copyright (c) 2012-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/* EHR_Lookups-11.30-11.33.sql */

/* EHR_Lookups-11.30-11.32.sql */

SELECT setval('ehr_lookups.treatment_frequency_rowid_seq', (select max(rowid) as maxVal from ehr_lookups.treatment_frequency));
SELECT setval('ehr_lookups.ageclass_rowid_seq', (select max(rowid) as maxVal from ehr_lookups.ageclass));

ALTER table ehr_lookups.blood_draw_services
   add column automaticrequestfromblooddraw boolean not null default true;

update ehr_lookups.blood_draw_services
   set automaticrequestfromblooddraw = false where service = 'Viral Load';

/* EHR_Lookups-11.32-11.33.sql */

--drop/recreate table
DROP TABLE IF EXISTS ehr_lookups.sample_types;
CREATE TABLE ehr_lookups.sample_types (
type character varying(20) NOT NULL,

CONSTRAINT PK_sample_types PRIMARY KEY (type)
)
WITH (
 OIDS=FALSE
);

INSERT INTO ehr_lookups.sample_types
(type) VALUES
('BAL'),
('FNA'),
('Impression Smear'),
('Skin Scraping')
;

--drop/recreate table
DROP TABLE IF EXISTS ehr_lookups.stain_types;
CREATE TABLE ehr_lookups.stain_types (
type character varying(20) NOT NULL,

CONSTRAINT PK_stain_types PRIMARY KEY (type)
)
WITH (
 OIDS=FALSE
);

INSERT INTO ehr_lookups.stain_types 
(type) VALUES
('Gram'),
('Wright''s'),
('Wright-Giemsa'),
('Ziehl-Neelson')
;

/* EHR_Lookups-11.33-11.34.sql */

--drop/recreate table
DROP TABLE IF EXISTS ehr_lookups.cytology_tests;
CREATE TABLE ehr_lookups.cytology_tests (
testid character varying(100) NOT NULL,
"name" character varying(100),
units character varying(100),
sort_order integer,
alertonabnormal boolean DEFAULT true,
alertonany boolean DEFAULT false,
includeinpanel boolean DEFAULT false,
CONSTRAINT PK_cytology_tests PRIMARY KEY (testid)
)
WITH (
 OIDS=FALSE
);

INSERT INTO ehr_lookups.cytology_tests
(testid, name, units, sort_order) VALUES
('BS', 'Basophils', '%', 15),
('EO', 'Eosinophils', '%', 14),
('HCT', 'Hematocrit', '%', 4),
('HGB', 'Hemoglobin', 'g/dL', 3),
('LY', 'Lymphocytes', '%', 12),
('MCH', 'Mean Corpuscular Hemoglobin', 'pg', 6),
('MCHC', 'Mean Corpuscular Hemoglobin Concentration', 'g/dL', 7),
('MCV', 'Mean Corpuscular Volume', 'fL', 10),
('MN', 'Monocytes', '%', 13),
('MPV', 'Mean Platelet Volume', 'fL', 10),
('NE', 'Neutrophils', '%', 11),
('PLT', 'Platelet', '10^3/uL', 9),
('RBC', 'Red Blood Cells', '10^6/uL', 2),
('RDW-CV', 'Red Blood Cell Distribution Width - Coefficient Variation', '%', 8),
('WBC', 'White Blood Cells', '10^3/uL', 1)
;

/* EHR_Lookups-11.35-11.36.sql */

--to drop:
DROP TABLE ehr_lookups.vl_virus;
DROP TABLE ehr_lookups.vl_technique;
DROP TABLE ehr_lookups.vl_sampletype;
DROP TABLE ehr_lookups.vl_instrument;
DROP TABLE ehr_lookups.vl_category;

DROP TABLE ehr_lookups.booleancombo;

alter table ehr_lookups.dental_teeth alter column teeth TYPE varchar(100);
alter table ehr_lookups.obs_behavior alter column code TYPE varchar(100);

alter table ehr_lookups.obs_breeding alter column code TYPE varchar(100);
alter table ehr_lookups.obs_feces alter column code TYPE varchar(100);
alter table ehr_lookups.obs_mens alter column code TYPE varchar(100);
alter table ehr_lookups.obs_other alter column code TYPE varchar(100);
alter table ehr_lookups.obs_remarks alter column title TYPE varchar(200);
alter table ehr_lookups.obs_tlocation alter column location TYPE varchar(100);

alter table ehr_lookups.obs_behavior alter column meaning TYPE varchar(200);
alter table ehr_lookups.obs_breeding alter column meaning TYPE varchar(200);
alter table ehr_lookups.obs_feces alter column meaning TYPE varchar(200);
alter table ehr_lookups.obs_mens alter column meaning TYPE varchar(200);
alter table ehr_lookups.obs_other alter column meaning TYPE varchar(200);
alter table ehr_lookups.obs_remarks alter column remark TYPE varchar(500);

/* EHR_Lookups-11.37-11.38.sql */

CREATE TABLE ehr_lookups.cage_type
(
  cagetype varchar(100) not null,
  length double precision,
  width double precision,
  height double precision,
  sqft double precision,

  CONSTRAINT pk_cage_type PRIMARY KEY (cagetype)
);
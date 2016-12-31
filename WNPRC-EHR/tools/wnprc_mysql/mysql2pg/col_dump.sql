/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


-- ----------------------------
-- Table structure for col_dump.notes
-- ----------------------------
DROP TABLE IF EXISTS col_dump.notes;
CREATE TABLE col_dump.notes (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
category varchar(255) DEFAULT NULL::character varying,
value varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.arrival
-- ----------------------------
DROP TABLE IF EXISTS col_dump.arrival;
CREATE TABLE col_dump.arrival (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
source varchar(255) DEFAULT NULL::character varying,
remark varchar(255) DEFAULT NULL::character varying,
parentid varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.assignment
-- ----------------------------
DROP TABLE IF EXISTS col_dump.assignment;
CREATE TABLE col_dump.assignment (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
project varchar(255) DEFAULT NULL::character varying,
rdate varchar(255) DEFAULT NULL::character varying,
parentid varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.bacteriologyresults
-- ----------------------------
DROP TABLE IF EXISTS col_dump.bacteriologyresults;
CREATE TABLE col_dump.bacteriologyresults (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
source varchar(255) DEFAULT NULL::character varying,
result varchar(255) DEFAULT NULL::character varying,
remark varchar(255) DEFAULT NULL::character varying,
antibiotic varchar(255) DEFAULT NULL::character varying,
sensitivity varchar(255) DEFAULT NULL::character varying,
runId varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL,
sourceMeaning varchar(255) DEFAULT NULL::character varying,
resultMeaning varchar(255) DEFAULT NULL::character varying,
antibioticMeaning varchar(255) DEFAULT NULL::character varying
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.bacteriologyruns
-- ----------------------------
DROP TABLE IF EXISTS col_dump.bacteriologyruns;
CREATE TABLE col_dump.bacteriologyruns (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
account varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.behavetrem
-- ----------------------------
DROP TABLE IF EXISTS col_dump.behavetrem;
CREATE TABLE col_dump.behavetrem (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.biopsy
-- ----------------------------
DROP TABLE IF EXISTS col_dump.biopsy;
CREATE TABLE col_dump.biopsy (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
caseno varchar(255) DEFAULT NULL::character varying,
account varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.biopsydiag
-- ----------------------------
DROP TABLE IF EXISTS col_dump.biopsydiag;
CREATE TABLE col_dump.biopsydiag (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
seq1 varchar(255) DEFAULT NULL::character varying,
seq2 varchar(255) DEFAULT NULL::character varying,
code varchar(255) DEFAULT NULL::character varying,
parentid varchar(255) DEFAULT NULL::character varying,
meaning varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.birth
-- ----------------------------
DROP TABLE IF EXISTS col_dump.birth;
CREATE TABLE col_dump.birth (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.blood
-- ----------------------------
DROP TABLE IF EXISTS col_dump.blood;
CREATE TABLE col_dump.blood (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
quantity varchar(255) DEFAULT NULL::character varying,
done_by varchar(255) DEFAULT NULL::character varying,
done_for varchar(255) DEFAULT NULL::character varying,
project varchar(255) DEFAULT NULL::character varying,
p_s varchar(255) DEFAULT NULL::character varying,
a_v varchar(255) DEFAULT NULL::character varying,
code varchar(255) DEFAULT NULL::character varying,
caretaker varchar(255) DEFAULT NULL::character varying,
tube_type varchar(255) DEFAULT NULL::character varying,
parentid varchar(255) DEFAULT NULL::character varying,
meaning varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.cage
-- ----------------------------
DROP TABLE IF EXISTS col_dump.cage;
CREATE TABLE col_dump.cage (
roomcage varchar(255) DEFAULT NULL::character varying,
room varchar(255) DEFAULT NULL::character varying,
cage varchar(255) DEFAULT NULL::character varying,
length varchar(255) DEFAULT NULL::character varying,
width varchar(255) DEFAULT NULL::character varying,
height varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.cageclass
-- ----------------------------
DROP TABLE IF EXISTS col_dump.cageclass;
CREATE TABLE col_dump.cageclass (
low varchar(255) DEFAULT NULL::character varying,
high varchar(255) DEFAULT NULL::character varying,
sqft varchar(255) DEFAULT NULL::character varying,
height varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.cagenotes
-- ----------------------------
DROP TABLE IF EXISTS col_dump.cagenotes;
CREATE TABLE col_dump.cagenotes (
roomcage varchar(255) DEFAULT NULL::character varying,
room varchar(255) DEFAULT NULL::character varying,
cage varchar(255) DEFAULT NULL::character varying,
note varchar(255) DEFAULT NULL::character varying,
date varchar(255) DEFAULT NULL::character varying,
userid varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.chemistryresults
-- ----------------------------
DROP TABLE IF EXISTS col_dump.chemistryresults;
CREATE TABLE col_dump.chemistryresults (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.chemistryruns
-- ----------------------------
DROP TABLE IF EXISTS col_dump.chemistryruns;
CREATE TABLE col_dump.chemistryruns (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.chemnorm
-- ----------------------------
DROP TABLE IF EXISTS col_dump.chemnorm;
CREATE TABLE col_dump.chemnorm (
testname varchar(255) DEFAULT NULL::character varying,
unit varchar(255) DEFAULT NULL::character varying,
juv_m varchar(255) DEFAULT NULL::character varying,
juv_f varchar(255) DEFAULT NULL::character varying,
adult_m varchar(255) DEFAULT NULL::character varying,
adult_f varchar(255) DEFAULT NULL::character varying,
ger_m varchar(255) DEFAULT NULL::character varying,
ger_f varchar(255) DEFAULT NULL::character varying,
species varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.clinremarks
-- ----------------------------
DROP TABLE IF EXISTS col_dump.clinremarks;
CREATE TABLE col_dump.clinremarks (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.deleted_records
-- ----------------------------
DROP TABLE IF EXISTS col_dump.deleted_records;
CREATE TABLE col_dump.deleted_records (
id varchar(255) DEFAULT NULL::character varying NOT NULL,
uuid varchar(255) DEFAULT NULL::character varying,
tableName varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.demographics
-- ----------------------------
DROP TABLE IF EXISTS col_dump.demographics;
CREATE TABLE col_dump.demographics (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
gender varchar(255) DEFAULT NULL::character varying,
status varchar(255) DEFAULT NULL::character varying,
avail varchar(255) DEFAULT NULL::character varying,
hold varchar(255) DEFAULT NULL::character varying,
dam varchar(255) DEFAULT NULL::character varying,
sire varchar(255) DEFAULT NULL::character varying,
origin varchar(255) DEFAULT NULL::character varying,
birth varchar(255) DEFAULT NULL::character varying,
death varchar(255) DEFAULT NULL::character varying,
arrivedate varchar(255) DEFAULT NULL::character varying,
departdate varchar(255) DEFAULT NULL::character varying,
room varchar(255) DEFAULT NULL::character varying,
cage varchar(255) DEFAULT NULL::character varying,
cond varchar(255) DEFAULT NULL::character varying,
weight varchar(255) DEFAULT NULL::character varying,
wdate varchar(255) DEFAULT NULL::character varying,
tbdate varchar(255) DEFAULT NULL::character varying,
medical varchar(255) DEFAULT NULL::character varying,
purchasedby varchar(255) DEFAULT NULL::character varying,
v_status varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL,
parentid varchar(255) DEFAULT NULL::character varying
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.departure
-- ----------------------------
DROP TABLE IF EXISTS col_dump.departure;
CREATE TABLE col_dump.departure (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.drug
-- ----------------------------
DROP TABLE IF EXISTS col_dump.drug;
CREATE TABLE col_dump.drug (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
project varchar(255) DEFAULT NULL::character varying,
code varchar(255) DEFAULT NULL::character varying,
amount varchar(255) DEFAULT NULL::character varying,
units varchar(255) DEFAULT NULL::character varying,
route varchar(255) DEFAULT NULL::character varying,
begintime varchar(255) DEFAULT NULL::character varying,
endtime varchar(255) DEFAULT NULL::character varying,
remark varchar(5000) DEFAULT NULL::character varying,
category varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL,
parentid varchar(255) DEFAULT NULL::character varying,
meaning varchar(255) DEFAULT NULL::character varying
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.encounters
-- ----------------------------
DROP TABLE IF EXISTS col_dump.encounters;
CREATE TABLE col_dump.encounters (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.hematologymorphology
-- ----------------------------
DROP TABLE IF EXISTS col_dump.hematologymorphology;
CREATE TABLE col_dump.hematologymorphology (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
morphology varchar(255) DEFAULT NULL::character varying,
account varchar(255) DEFAULT NULL::character varying,
requestId varchar(255) DEFAULT NULL::character varying,
runId varchar(255) DEFAULT NULL::character varying,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL,
ts timestamp(6) DEFAULT NULL::timestamp without time zone
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.hematologyresults
-- ----------------------------
DROP TABLE IF EXISTS col_dump.hematologyresults;
CREATE TABLE col_dump.hematologyresults (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.hematologyruns
-- ----------------------------
DROP TABLE IF EXISTS col_dump.hematologyruns;
CREATE TABLE col_dump.hematologyruns (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
account varchar(255) DEFAULT NULL::character varying,
remark varchar(255) DEFAULT NULL::character varying,
clinremark varchar(255) DEFAULT NULL::character varying,
requestId varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.hold
-- ----------------------------
DROP TABLE IF EXISTS col_dump.hold;
CREATE TABLE col_dump.hold (
code varchar(255) DEFAULT NULL::character varying,
meaning varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.housing
-- ----------------------------
DROP TABLE IF EXISTS col_dump.housing;
CREATE TABLE col_dump.housing (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
room varchar(255) DEFAULT NULL::character varying,
cage varchar(255) DEFAULT NULL::character varying,
cond varchar(255) DEFAULT NULL::character varying,
odate varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.immunologyresults
-- ----------------------------
DROP TABLE IF EXISTS col_dump.immunologyresults;
CREATE TABLE col_dump.immunologyresults (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
testid varchar(255) DEFAULT NULL::character varying,
result varchar(255) DEFAULT NULL::character varying,
units varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL,
runId varchar(255) DEFAULT NULL::character varying
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.immunologyruns
-- ----------------------------
DROP TABLE IF EXISTS col_dump.immunologyruns;
CREATE TABLE col_dump.immunologyruns (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
requestId varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.necropsy
-- ----------------------------
DROP TABLE IF EXISTS col_dump.necropsy;
CREATE TABLE col_dump.necropsy (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
caseno varchar(255) DEFAULT NULL::character varying,
account varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.necropsydiag
-- ----------------------------
DROP TABLE IF EXISTS col_dump.necropsydiag;
CREATE TABLE col_dump.necropsydiag (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
parentid varchar(255) DEFAULT NULL::character varying,
seq1 varchar(255) DEFAULT NULL::character varying,
seq2 varchar(255) DEFAULT NULL::character varying,
code varchar(255) DEFAULT NULL::character varying,
meaning varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.newsnomed
-- ----------------------------
DROP TABLE IF EXISTS col_dump.newsnomed;
CREATE TABLE col_dump.newsnomed (
code varchar(255) DEFAULT NULL::character varying,
meaning varchar(4000) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.obs
-- ----------------------------
DROP TABLE IF EXISTS col_dump.obs;
CREATE TABLE col_dump.obs (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
userid varchar(255) DEFAULT NULL::character varying,
feces varchar(255) DEFAULT NULL::character varying,
menses varchar(255) DEFAULT NULL::character varying,
behavior varchar(255) DEFAULT NULL::character varying,
breeding varchar(255) DEFAULT NULL::character varying,
other varchar(255) DEFAULT NULL::character varying,
tlocation varchar(255) DEFAULT NULL::character varying,
remark varchar(255) DEFAULT NULL::character varying,
otherbehavior varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.parasitologyresults
-- ----------------------------
DROP TABLE IF EXISTS col_dump.parasitologyresults;
CREATE TABLE col_dump.parasitologyresults (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
seq varchar(255) DEFAULT NULL::character varying,
code varchar(255) DEFAULT NULL::character varying,
meaning varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL,
runId varchar(255) DEFAULT NULL::character varying,
parentId varchar(255) DEFAULT NULL::character varying
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.parasitologyruns
-- ----------------------------
DROP TABLE IF EXISTS col_dump.parasitologyruns;
CREATE TABLE col_dump.parasitologyruns (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
room varchar(255) DEFAULT NULL::character varying,
account varchar(255) DEFAULT NULL::character varying,
remark varchar(255) DEFAULT NULL::character varying,
clinremark varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.perdiemrates
-- ----------------------------
DROP TABLE IF EXISTS col_dump.perdiemrates;
CREATE TABLE col_dump.perdiemrates (
type varchar(255) DEFAULT NULL::character varying,
rate varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.prenatal
-- ----------------------------
DROP TABLE IF EXISTS col_dump.prenatal;
CREATE TABLE col_dump.prenatal (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
species varchar(255) DEFAULT NULL::character varying,
gender varchar(255) DEFAULT NULL::character varying,
weight varchar(255) DEFAULT NULL::character varying,
dam varchar(255) DEFAULT NULL::character varying,
sire varchar(255) DEFAULT NULL::character varying,
room varchar(255) DEFAULT NULL::character varying,
cage varchar(255) DEFAULT NULL::character varying,
conception varchar(255) DEFAULT NULL::character varying,
remark varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.problem
-- ----------------------------
DROP TABLE IF EXISTS col_dump.problem;
CREATE TABLE col_dump.problem (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
problem_no varchar(255) DEFAULT NULL::character varying,
remark varchar(255) DEFAULT NULL::character varying,
date_observed varchar(255) DEFAULT NULL::character varying,
date_resolved varchar(255) DEFAULT NULL::character varying,
code varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.procedures
-- ----------------------------
DROP TABLE IF EXISTS col_dump.procedures;
CREATE TABLE col_dump.procedures (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
code varchar(255) DEFAULT NULL::character varying,
meaning varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL,
parentid varchar(255) DEFAULT NULL::character varying
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.project
-- ----------------------------
DROP TABLE IF EXISTS col_dump.project;
CREATE TABLE col_dump.project (
project varchar(255) DEFAULT NULL::character varying,
protocol varchar(255) DEFAULT NULL::character varying,
account varchar(255) DEFAULT NULL::character varying,
inves varchar(255) DEFAULT NULL::character varying,
avail varchar(255) DEFAULT NULL::character varying,
title varchar(255) DEFAULT NULL::character varying,
research varchar(255) DEFAULT NULL::character varying,
reqname varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.protocol
-- ----------------------------
DROP TABLE IF EXISTS col_dump.protocol;
CREATE TABLE col_dump.protocol (
protocol varchar(255) DEFAULT NULL::character varying,
inves varchar(255) DEFAULT NULL::character varying,
approve varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.protocol_counts
-- ----------------------------
DROP TABLE IF EXISTS col_dump.protocol_counts;
CREATE TABLE col_dump.protocol_counts (
protocol varchar(255) DEFAULT NULL::character varying,
parentid varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
species varchar(255) DEFAULT NULL::character varying,
allowed varchar(255) DEFAULT NULL::character varying,
startdate varchar(255) DEFAULT NULL::character varying,
enddate varchar(255) DEFAULT NULL::character varying,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.ref_range
-- ----------------------------
DROP TABLE IF EXISTS col_dump.ref_range;
CREATE TABLE col_dump.ref_range (
species varchar(255) DEFAULT NULL::character varying,
gender varchar(255) DEFAULT NULL::character varying,
age_class varchar(255) DEFAULT NULL::character varying,
test varchar(255) DEFAULT NULL::character varying,
ref_range_min varchar(255) DEFAULT NULL::character varying,
ref_range_max varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.rhesaux
-- ----------------------------
DROP TABLE IF EXISTS col_dump.rhesaux;
CREATE TABLE col_dump.rhesaux (
id varchar(255) DEFAULT NULL::character varying,
name varchar(255) DEFAULT NULL::character varying,
info1 varchar(255) DEFAULT NULL::character varying,
info2 varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.snomap
-- ----------------------------
DROP TABLE IF EXISTS col_dump.snomap;
CREATE TABLE col_dump.snomap (
ocode varchar(255) DEFAULT NULL::character varying,
ncode varchar(255) DEFAULT NULL::character varying,
meaning varchar(255) DEFAULT NULL::character varying,
date varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.snomed
-- ----------------------------
DROP TABLE IF EXISTS col_dump.snomed;
CREATE TABLE col_dump.snomed (
code varchar(255) DEFAULT NULL::character varying,
meaning varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.surgery
-- ----------------------------
DROP TABLE IF EXISTS col_dump.surgery;
CREATE TABLE col_dump.surgery (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
age varchar(255) DEFAULT NULL::character varying,
inves varchar(255) DEFAULT NULL::character varying,
project varchar(255) DEFAULT NULL::character varying,
surgeon varchar(255) DEFAULT NULL::character varying,
enddate varchar(255) DEFAULT NULL::character varying,
major varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.surgsum
-- ----------------------------
DROP TABLE IF EXISTS col_dump.surgsum;
CREATE TABLE col_dump.surgsum (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
project varchar(255) DEFAULT NULL::character varying,
so varchar(6000) DEFAULT NULL::character varying,
a varchar(6000) DEFAULT NULL::character varying,
p varchar(6000) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL,
parentid varchar(255) DEFAULT NULL::character varying
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.tb
-- ----------------------------
DROP TABLE IF EXISTS col_dump.tb;
CREATE TABLE col_dump.tb (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
lot varchar(255) DEFAULT NULL::character varying,
dilution varchar(255) DEFAULT NULL::character varying,
eye varchar(255) DEFAULT NULL::character varying,
result1 varchar(255) DEFAULT NULL::character varying,
result2 varchar(255) DEFAULT NULL::character varying,
result3 varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.tissue_requests
-- ----------------------------
DROP TABLE IF EXISTS col_dump.tissue_requests;
CREATE TABLE col_dump.tissue_requests (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
gender varchar(255) DEFAULT NULL::character varying,
livedead varchar(255) DEFAULT NULL::character varying,
wbo varchar(255) DEFAULT NULL::character varying,
tissue varchar(255) DEFAULT NULL::character varying,
source varchar(255) DEFAULT NULL::character varying,
dest varchar(255) DEFAULT NULL::character varying,
recip varchar(255) DEFAULT NULL::character varying,
affil varchar(255) DEFAULT NULL::character varying,
remark varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.treatment_order
-- ----------------------------
DROP TABLE IF EXISTS col_dump.treatment_order;
CREATE TABLE col_dump.treatment_order (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
project varchar(255) DEFAULT NULL::character varying,
code varchar(255) DEFAULT NULL::character varying,
meaning varchar(255) DEFAULT NULL::character varying,
volume varchar(255) DEFAULT NULL::character varying,
vunits varchar(255) DEFAULT NULL::character varying,
conc varchar(255) DEFAULT NULL::character varying,
cunits varchar(255) DEFAULT NULL::character varying,
amount varchar(255) DEFAULT NULL::character varying,
units varchar(255) DEFAULT NULL::character varying,
route varchar(255) DEFAULT NULL::character varying,
enddate varchar(255) DEFAULT NULL::character varying,
frequency varchar(255) DEFAULT NULL::character varying,
remark varchar(5000) DEFAULT NULL::character varying,
userid varchar(255) DEFAULT NULL::character varying,
snomedMeaning varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.urinalysisresults
-- ----------------------------
DROP TABLE IF EXISTS col_dump.urinalysisresults;
CREATE TABLE col_dump.urinalysisresults (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.urinalysisruns
-- ----------------------------
DROP TABLE IF EXISTS col_dump.urinalysisruns;
CREATE TABLE col_dump.urinalysisruns (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
account varchar(255) DEFAULT NULL::character varying,
userid varchar(255) DEFAULT NULL::character varying,
method varchar(255) DEFAULT NULL::character varying,
quantity varchar(255) DEFAULT NULL::character varying,
remark varchar(255) DEFAULT NULL::character varying,
requestId varchar(255) DEFAULT NULL::character varying,
parentId varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.virologyresults
-- ----------------------------
DROP TABLE IF EXISTS col_dump.virologyresults;
CREATE TABLE col_dump.virologyresults (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
seq varchar(255) DEFAULT NULL::character varying,
result varchar(255) DEFAULT NULL::character varying,
source varchar(255) DEFAULT NULL::character varying,
virus varchar(255) DEFAULT NULL::character varying,
runId varchar(255) DEFAULT NULL::character varying,
parentid varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.virologyruns
-- ----------------------------
DROP TABLE IF EXISTS col_dump.virologyruns;
CREATE TABLE col_dump.virologyruns (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
account varchar(255) DEFAULT NULL::character varying,
remark varchar(255) DEFAULT NULL::character varying,
clinremark varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.weight
-- ----------------------------
DROP TABLE IF EXISTS col_dump.weight;
CREATE TABLE col_dump.weight (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
weight varchar(255) DEFAULT NULL::character varying,
verified varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Alter Sequences Owned By 
-- ----------------------------

-- ----------------------------
-- Primary Key structure for table col_dump.arrival
-- ----------------------------
ALTER TABLE col_dump.arrival ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.bacteriologyresults
-- ----------------------------
ALTER TABLE col_dump.bacteriologyresults ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.bacteriologyruns
-- ----------------------------
ALTER TABLE col_dump.bacteriologyruns ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.behavetrem
-- ----------------------------
ALTER TABLE col_dump.behavetrem ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.biopsy
-- ----------------------------
ALTER TABLE col_dump.biopsy ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.biopsydiag
-- ----------------------------
ALTER TABLE col_dump.biopsydiag ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.birth
-- ----------------------------
ALTER TABLE col_dump.birth ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.blood
-- ----------------------------
ALTER TABLE col_dump.blood ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.cage
-- ----------------------------
ALTER TABLE col_dump.cage ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.cageclass
-- ----------------------------
ALTER TABLE col_dump.cageclass ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.chemistryresults
-- ----------------------------
ALTER TABLE col_dump.chemistryresults ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.chemistryruns
-- ----------------------------
ALTER TABLE col_dump.chemistryruns ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.chemnorm
-- ----------------------------
ALTER TABLE col_dump.chemnorm ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.clinremarks
-- ----------------------------
ALTER TABLE col_dump.clinremarks ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.deleted_records
-- ----------------------------
ALTER TABLE col_dump.deleted_records ADD PRIMARY KEY (id);

-- ----------------------------
-- Primary Key structure for table col_dump.demographics
-- ----------------------------
ALTER TABLE col_dump.demographics ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.departure
-- ----------------------------
ALTER TABLE col_dump.departure ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.drug
-- ----------------------------
ALTER TABLE col_dump.drug ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.encounters
-- ----------------------------
ALTER TABLE col_dump.encounters ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.hematologymorphology
-- ----------------------------
ALTER TABLE col_dump.hematologymorphology ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.hematologyresults
-- ----------------------------
ALTER TABLE col_dump.hematologyresults ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.hold
-- ----------------------------
ALTER TABLE col_dump.hold ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.immunologyresults
-- ----------------------------
ALTER TABLE col_dump.immunologyresults ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.immunologyruns
-- ----------------------------
ALTER TABLE col_dump.immunologyruns ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.necropsy
-- ----------------------------
ALTER TABLE col_dump.necropsy ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.necropsydiag
-- ----------------------------
ALTER TABLE col_dump.necropsydiag ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.newsnomed
-- ----------------------------
ALTER TABLE col_dump.newsnomed ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.obs
-- ----------------------------
ALTER TABLE col_dump.obs ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.parasitologyresults
-- ----------------------------
ALTER TABLE col_dump.parasitologyresults ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.parasitologyruns
-- ----------------------------
ALTER TABLE col_dump.parasitologyruns ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.perdiemrates
-- ----------------------------
ALTER TABLE col_dump.perdiemrates ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.prenatal
-- ----------------------------
ALTER TABLE col_dump.prenatal ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.problem
-- ----------------------------
ALTER TABLE col_dump.problem ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.procedures
-- ----------------------------
ALTER TABLE col_dump.procedures ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.project
-- ----------------------------
ALTER TABLE col_dump.project ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.protocol
-- ----------------------------
ALTER TABLE col_dump.protocol ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.protocol_counts
-- ----------------------------
ALTER TABLE col_dump.protocol_counts ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.ref_range
-- ----------------------------
ALTER TABLE col_dump.ref_range ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.rhesaux
-- ----------------------------
ALTER TABLE col_dump.rhesaux ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.snomap
-- ----------------------------
ALTER TABLE col_dump.snomap ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.snomed
-- ----------------------------
ALTER TABLE col_dump.snomed ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.surgery
-- ----------------------------
ALTER TABLE col_dump.surgery ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.surgsum
-- ----------------------------
ALTER TABLE col_dump.surgsum ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.tb
-- ----------------------------
ALTER TABLE col_dump.tb ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.tissue_requests
-- ----------------------------
ALTER TABLE col_dump.tissue_requests ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.treatment_order
-- ----------------------------
ALTER TABLE col_dump.treatment_order ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.urinalysisresults
-- ----------------------------
ALTER TABLE col_dump.urinalysisresults ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.urinalysisruns
-- ----------------------------
ALTER TABLE col_dump.urinalysisruns ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.virologyresults
-- ----------------------------
ALTER TABLE col_dump.virologyresults ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.virologyruns
-- ----------------------------
ALTER TABLE col_dump.virologyruns ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.weight
-- ----------------------------
ALTER TABLE col_dump.weight ADD PRIMARY KEY (objectid);

-- ----------------------------
-- Primary Key structure for table col_dump.notes
-- ----------------------------
ALTER TABLE col_dump.notes ADD PRIMARY KEY (objectid);


DROP TABLE IF EXISTS col_dump.clinpathruns;
CREATE TABLE col_dump.clinpathruns
(
  id character varying(32),
  date timestamp without time zone,
  ts timestamp(6) DEFAULT NULL::timestamp without time zone,
  objectid character varying(4000) primary key
)
WITH (
  OIDS=FALSE
);

-- ----------------------------
-- Table structure for col_dump.morphologicdiagnosis
-- ----------------------------
DROP TABLE IF EXISTS col_dump.morphologicdiagnosis;
CREATE TABLE col_dump.morphologicdiagnosis (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying NOT NULL primary key
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Table structure for col_dump.cageObs
-- ----------------------------
DROP TABLE IF EXISTS col_dump.cageObs;
CREATE TABLE col_dump.cageObs (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
roomattime varchar(255) DEFAULT NULL::character varying,
cageattime varchar(255) DEFAULT NULL::character varying,
observationRecord varchar(255) DEFAULT NULL::character varying,
housingRecord varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying primary key
)
WITH (OIDS=FALSE)

;


-- ----------------------------
-- Table structure for col_dump.deaths
-- ----------------------------
DROP TABLE IF EXISTS col_dump.deaths;
CREATE TABLE col_dump.deaths (
Id varchar(255) DEFAULT NULL::character varying,
Date timestamp(6) DEFAULT NULL::timestamp without time zone,
status varchar(255) DEFAULT NULL::character varying,
cause varchar(255) DEFAULT NULL::character varying,
ts timestamp(6) DEFAULT NULL::timestamp without time zone,
objectid varchar(255) DEFAULT NULL::character varying primary key
)
WITH (OIDS=FALSE)

;


/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--alopecia cause
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('alopecia_cause', 'Alopecia Cause', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'alopecia_cause';
INSERT INTO ehr_lookups.lookups (set_name, value)
SELECT
   'alopecia_cause' as set_name,
   cause as value
FROM ehr_lookups.alopecia_cause;

DROP TABLE ehr_lookups.alopecia_cause;


--alopecia_score
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('alopecia_score', 'Alopecia Score', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'alopecia_score';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'alopecia_score' as set_name,
   score as value,
   meaning as description
FROM ehr_lookups.alopecia_score;

DROP TABLE ehr_lookups.alopecia_score;


--hematology_score
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('hematology_score', 'Hematology Score', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'hematology_score';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'hematology_score' as set_name,
   score as value,
   null as description
FROM ehr_lookups.hematology_score;

DROP TABLE ehr_lookups.hematology_score;


--necropsy_perfusion_area
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('necropsy_perfusion_area', 'Necropsy Perfusion Area Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'necropsy_perfusion_area';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'necropsy_perfusion_area' as set_name,
   perfusion as value,
   null as description
FROM ehr_lookups.necropsy_perfusion_area;

DROP TABLE ehr_lookups.necropsy_perfusion_area;


--hematology_morphology
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('hematology_morphology', 'Hematology Morphology Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'hematology_morphology';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'hematology_morphology' as set_name,
   morphology as value,
   null as description
FROM ehr_lookups.hematology_morphology;

DROP TABLE ehr_lookups.hematology_morphology;


--stain_types
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('stain_types', 'Stain Type Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'stain_types';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'stain_types' as set_name,
   type as value,
   null as description
FROM ehr_lookups.stain_types;

DROP TABLE ehr_lookups.stain_types;


--sample_types
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('sample_types', 'Sample Type Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'sample_types';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'sample_types' as set_name,
   type as value,
   null as description
FROM ehr_lookups.sample_types;

DROP TABLE ehr_lookups.sample_types;


--pairtest_conclusion
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('pairtest_conclusion', 'Pairtest Conclusion Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'pairtest_conclusion';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'pairtest_conclusion' as set_name,
   value as value,
   null as description
FROM ehr_lookups.pairtest_conclusion;

DROP TABLE ehr_lookups.pairtest_conclusion;


--necropsy_perfusion
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('necropsy_perfusion', 'Necropsy Perfusion Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'necropsy_perfusion';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'necropsy_perfusion' as set_name,
   perfusion as value,
   null as description
FROM ehr_lookups.necropsy_perfusion;

DROP TABLE ehr_lookups.necropsy_perfusion;


--behavior_category
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('behavior_category', 'Behavior Category Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'behavior_category';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'behavior_category' as set_name,
   category as value,
   null as description
FROM ehr_lookups.behavior_category;

DROP TABLE ehr_lookups.behavior_category;


--bacteriology_sensitivity
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('bacteriology_sensitivity', 'Bacteriology Sensitivity Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'bacteriology_sensitivity';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'bacteriology_sensitivity' as set_name,
   code as value,
   meaning as description
FROM ehr_lookups.bacteriology_sensitivity;

DROP TABLE ehr_lookups.bacteriology_sensitivity;


--tb_result
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('tb_result', 'TB Result Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'tb_result';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'tb_result' as set_name,
   result as value,
   null as description
FROM ehr_lookups.tb_result;

DROP TABLE ehr_lookups.tb_result;


--obs_feces
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField, titleColumn)
VALUES ('obs_feces', 'Obs Feces Field Values', 'value', 'title');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'obs_feces';
INSERT INTO ehr_lookups.lookups (set_name, value, title)
SELECT
   'obs_feces' as set_name,
   code as value,
   meaning as title
FROM ehr_lookups.obs_feces;

DROP TABLE ehr_lookups.obs_feces;


--dental_side
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('dental_side', 'Dental Side Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'dental_side';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'dental_side' as set_name,
   side as value,
   null as description
FROM ehr_lookups.dental_side;

DROP TABLE ehr_lookups.dental_side;


--birth_type
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField, titleColumn)
VALUES ('birth_type', 'Birth Type Field Values', 'value', 'title');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'birth_type';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'birth_type' as set_name,
   type as value,
   meaning as description
FROM ehr_lookups.birth_type;

DROP TABLE ehr_lookups.birth_type;


--dental_jaw
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('dental_jaw', 'Dental Jaw Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'dental_jaw';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'dental_jaw' as set_name,
   jaw as value,
   null as description
FROM ehr_lookups.dental_jaw;

DROP TABLE ehr_lookups.dental_jaw;


--necropsy_condition
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('necropsy_condition', 'Necropsy Condition Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'necropsy_condition';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'necropsy_condition' as set_name,
   score as value,
   null as description
FROM ehr_lookups.necropsy_condition;

DROP TABLE ehr_lookups.necropsy_condition;


--avail_codes
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('avail_codes', 'Availability Code Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'avail_codes';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'avail_codes' as set_name,
   code as value,
   meaning as description
FROM ehr_lookups.avail_codes;

DROP TABLE ehr_lookups.avail_codes;


--status_codes
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField, titleColumn)
VALUES ('status_codes', 'Status Code Field Values', 'value', 'title');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'status_codes';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'status_codes' as set_name,
   code as value,
   meaning as description
FROM ehr_lookups.status_codes;

DROP TABLE ehr_lookups.status_codes;


--problem_list_category
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('problem_list_category', 'Problem List Category Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'problem_list_category';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'problem_list_category' as set_name,
   category as value,
   null as description
FROM ehr_lookups.problem_list_category;

DROP TABLE ehr_lookups.problem_list_category;


--housing_reason
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('housing_reason', 'Housing Reason Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'housing_reason';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'housing_reason' as set_name,
   reason as value,
   null as description
FROM ehr_lookups.housing_reason;

DROP TABLE ehr_lookups.housing_reason;


--histology_stain
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('histology_stain', 'Histology Stain Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'histology_stain';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'histology_stain' as set_name,
   stain as value,
   null as description
FROM ehr_lookups.histology_stain;

DROP TABLE ehr_lookups.histology_stain;


--tissue_recipients
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('tissue_recipients', 'Tissue Recipients Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'tissue_recipients';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'tissue_recipients' as set_name,
   recipient as value,
   null as description
FROM ehr_lookups.tissue_recipients;

DROP TABLE ehr_lookups.tissue_recipients;


--clinpath_sampletype
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('clinpath_sampletype', 'Clinpath Sample Type Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'clinpath_sampletype';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'clinpath_sampletype' as set_name,
   sampletype as value,
   null as description
FROM ehr_lookups.clinpath_sampletype;

DROP TABLE ehr_lookups.clinpath_sampletype;


--clinpath_types
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('clinpath_types', 'Clinpath Type Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'clinpath_types';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'clinpath_types' as set_name,
   type as value,
   null as description
FROM ehr_lookups.clinpath_types;

DROP TABLE ehr_lookups.clinpath_types;


--urinalysis_qualitative_results
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('urinalysis_qualitative_results', 'Urinalysis Qualitative Result Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'urinalysis_qualitative_results';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'urinalysis_qualitative_results' as set_name,
   result as value,
   null as description
FROM ehr_lookups.urinalysis_qualitative_results;

DROP TABLE ehr_lookups.urinalysis_qualitative_results;


--tattoo_status
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('tattoo_status', 'Tattoo Status Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'tattoo_status';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'tattoo_status' as set_name,
   status as value,
   null as description
FROM ehr_lookups.tattoo_status;

DROP TABLE ehr_lookups.tattoo_status;


--pe_remarks
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('pe_remarks', 'PE Remarks Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'pe_remarks';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'pe_remarks' as set_name,
   remark as value,
   null as description
FROM ehr_lookups.pe_remarks;

DROP TABLE ehr_lookups.pe_remarks;


--blood_code_prefixes
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('blood_code_prefixes', 'Blood Code Prefix Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'blood_code_prefixes';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'blood_code_prefixes' as set_name,
   prefix as value,
   null as description
FROM ehr_lookups.blood_code_prefixes;

DROP TABLE ehr_lookups.blood_code_prefixes;


--snomed_qualifiers
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('snomed_qualifiers', 'SNOMED Qualifiers Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'snomed_qualifiers';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'snomed_qualifiers' as set_name,
   qualifier as value,
   null as description
FROM ehr_lookups.snomed_qualifiers;

DROP TABLE ehr_lookups.snomed_qualifiers;


--preservation_solutions
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('preservation_solutions', 'Preservation Solution Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'preservation_solutions';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'preservation_solutions' as set_name,
   solution as value,
   null as description
FROM ehr_lookups.preservation_solutions;

DROP TABLE ehr_lookups.preservation_solutions;


--chemistry_method
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('chemistry_method', 'Chemistry Method Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'chemistry_method';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'chemistry_method' as set_name,
   method as value,
   null as description
FROM ehr_lookups.chemistry_method;

DROP TABLE ehr_lookups.chemistry_method;


--immunology_method
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('immunology_method', 'Immunology Method Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'immunology_method';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'immunology_method' as set_name,
   method as value,
   null as description
FROM ehr_lookups.immunology_method;

DROP TABLE ehr_lookups.immunology_method;


--virology_method
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('virology_method', 'Virology Method Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'virology_method';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'virology_method' as set_name,
   method as value,
   null as description
FROM ehr_lookups.virology_method;

DROP TABLE ehr_lookups.virology_method;


--hematology_method
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('hematology_method', 'Hematology Method Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'hematology_method';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'hematology_method' as set_name,
   method as value,
   null as description
FROM ehr_lookups.hematology_method;

DROP TABLE ehr_lookups.hematology_method;


--biopsy_type
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('biopsy_type', 'Biopsy Type Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'biopsy_type';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'biopsy_type' as set_name,
   type as value,
   null as description
FROM ehr_lookups.biopsy_type;

DROP TABLE ehr_lookups.biopsy_type;


--microchip_comments
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('microchip_comments', 'Microchip Comments Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'microchip_comments';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'microchip_comments' as set_name,
   comment as value,
   null as description
FROM ehr_lookups.microchip_comments;

DROP TABLE ehr_lookups.microchip_comments;


--restraint_duration
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('restraint_duration', 'Restraint Duration Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'restraint_duration';
INSERT INTO ehr_lookups.lookups (set_name, value, description, sort_order)
SELECT
   'restraint_duration' as set_name,
   duration as value,
   null as description,
   sort_order as sort_order
FROM ehr_lookups.restraint_duration;

DROP TABLE ehr_lookups.restraint_duration;


--drug_categories
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('drug_categories', 'Drug Category Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'drug_categories';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'drug_categories' as set_name,
   category as value,
   null as description
FROM ehr_lookups.drug_categories;

DROP TABLE ehr_lookups.drug_categories;


--chow_types
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('chow_types', 'Chow Types Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'chow_types';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'chow_types' as set_name,
   type as value,
   null as description
FROM ehr_lookups.chow_types;

DROP TABLE ehr_lookups.chow_types;


--tissue_distribution
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('tissue_distribution', 'Tissue Distribution Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'tissue_distribution';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'tissue_distribution' as set_name,
   location as value,
   null as description
FROM ehr_lookups.tissue_distribution;

DROP TABLE ehr_lookups.tissue_distribution;


--container_types
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('container_types', 'Container Types Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'container_types';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'container_types' as set_name,
   type as value,
   null as description
FROM ehr_lookups.container_types;

DROP TABLE ehr_lookups.container_types;

DROP TABLE ehr_lookups.error_types;

DROP TABLE ehr_lookups.charge_flags;


--birth_condition
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField, titleColumn)
VALUES ('birth_condition', 'Birth Condition Field Values', 'value', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'birth_condition';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'birth_condition' as set_name,
   meaning as value,
   null as description
FROM ehr_lookups.birth_condition;

DROP TABLE ehr_lookups.birth_condition;

--bacteriology_method
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('bacteriology_method', 'Bacteriology Method Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'bacteriology_method';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'bacteriology_method' as set_name,
   method as value,
   null as description
FROM ehr_lookups.bacteriology_method;

DROP TABLE ehr_lookups.bacteriology_method;


--clinpath_collection_method
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('clinpath_collection_method', 'Clinpath Collection Method Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'clinpath_collection_method';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'clinpath_collection_method' as set_name,
   method as value,
   null as description
FROM ehr_lookups.clinpath_collection_method;

DROP TABLE ehr_lookups.clinpath_collection_method;


--parasitology_method
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('parasitology_method', 'Parasitology Method Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'parasitology_method';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'parasitology_method' as set_name,
   method as value,
   null as description
FROM ehr_lookups.parasitology_method;

DROP TABLE ehr_lookups.parasitology_method;


--blood_billed_by
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField, titleColumn)
VALUES ('blood_billed_by', 'Blood Billed By Field Values', 'value', 'title');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'blood_billed_by';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'blood_billed_by' as set_name,
   code as value,
   title as description
FROM ehr_lookups.blood_billed_by;

DROP TABLE ehr_lookups.blood_billed_by;


--pairtest_bhav
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('pairtest_bhav', 'Pairtest Behavior Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'pairtest_bhav';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'pairtest_bhav' as set_name,
   value as value,
   null as description
FROM ehr_lookups.pairtest_bhav;

DROP TABLE ehr_lookups.pairtest_bhav;


--dental_tartar
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('dental_tartar', 'Dental Tartar Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'dental_tartar';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'dental_tartar' as set_name,
   result as value,
   null as description
FROM ehr_lookups.dental_tartar;

DROP TABLE ehr_lookups.dental_tartar;


--dental_status
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('dental_status', 'Dental Status Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'dental_status';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'dental_status' as set_name,
   status as value,
   null as description
FROM ehr_lookups.dental_status;

DROP TABLE ehr_lookups.dental_status;


--viral_status
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('viral_status', 'Viral Status Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'viral_status';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'viral_status' as set_name,
   viral_status as value,
   null as description
FROM ehr_lookups.viral_status;

DROP TABLE ehr_lookups.viral_status;


--clinremarks_category
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('clinremarks_category', 'Clinremarks Category Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'clinremarks_category';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'clinremarks_category' as set_name,
   category as value,
   null as description
FROM ehr_lookups.clinremarks_category;

DROP TABLE ehr_lookups.clinremarks_category;


--observations_anesthesia_recovery
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('observations_anesthesia_recovery', 'Observations Anesthesia Recovery Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'observations_anesthesia_recovery';
INSERT INTO ehr_lookups.lookups (set_name, value, description, sort_order)
SELECT
   'observations_anesthesia_recovery' as set_name,
   value as value,
   null as description,
   sort_order
FROM ehr_lookups.observations_anesthesia_recovery;

DROP TABLE ehr_lookups.observations_anesthesia_recovery;


--obs_mens
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField, titleColumn)
VALUES ('obs_mens', 'Obs Mens Field Values', 'value', 'title');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'obs_mens';
INSERT INTO ehr_lookups.lookups (set_name, value, title, description)
SELECT
   'obs_mens' as set_name,
   code as value,
   meaning as title,
   null as description
FROM ehr_lookups.obs_mens;

DROP TABLE ehr_lookups.obs_mens;


--dental_gingivitis
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('dental_gingivitis', 'Dental Gingivitis Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'dental_gingivitis';
INSERT INTO ehr_lookups.lookups (set_name, value, title, description, sort_order)
SELECT
   'dental_gingivitis' as set_name,
   result as value,
   null as title,
   null as description,
   sort_order
FROM ehr_lookups.dental_gingivitis;

DROP TABLE ehr_lookups.dental_gingivitis;


--hold_codes
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField, titleColumn)
VALUES ('hold_codes', 'Hold Codes Field Values', 'value', 'title');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'hold_codes';
INSERT INTO ehr_lookups.lookups (set_name, value, title, description, sort_order)
SELECT
   'hold_codes' as set_name,
   code as value,
   meaning as title,
   null as description,
   null as sort_order
FROM ehr_lookups.hold_codes;

DROP TABLE ehr_lookups.hold_codes;


--death_codes
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField, titleColumn)
VALUES ('death_codes', 'Death Codes Field Values', 'value', 'title');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'death_codes';
INSERT INTO ehr_lookups.lookups (set_name, value, title, description, sort_order)
SELECT
   'death_codes' as set_name,
   code as value,
   meaning as title,
   null as description,
   null as sort_order
FROM ehr_lookups.death_codes;

DROP TABLE ehr_lookups.death_codes;


--death_cause
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('death_cause', 'Death Cause Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'death_cause';
INSERT INTO ehr_lookups.lookups (set_name, value, title, description, sort_order)
SELECT
   'death_cause' as set_name,
   cause as value,
   null as title,
   null as description,
   null as sort_order
FROM ehr_lookups.death_cause;

DROP TABLE ehr_lookups.death_cause;


--death_manner
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('death_manner', 'Manner of Death Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'death_manner';
INSERT INTO ehr_lookups.lookups (set_name, value, title, description, sort_order)
SELECT
   'death_manner' as set_name,
   manner as value,
   null as title,
   null as description,
   null as sort_order
FROM ehr_lookups.death_manner;

DROP TABLE ehr_lookups.death_manner;


--encounter_types
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('encounter_types', 'Encounter Types Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'encounter_types';
INSERT INTO ehr_lookups.lookups (set_name, value, title, description, sort_order)
SELECT
   'encounter_types' as set_name,
   type as value,
   null as title,
   null as description,
   null as sort_order
FROM ehr_lookups.encounter_types;

DROP TABLE ehr_lookups.encounter_types;


--urinalysis_method
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('urinalysis_method', 'Urinalysis Method Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'urinalysis_method';
INSERT INTO ehr_lookups.lookups (set_name, value, title, description, sort_order)
SELECT
   'urinalysis_method' as set_name,
   method as value,
   null as title,
   null as description,
   null as sort_order
FROM ehr_lookups.urinalysis_method;

DROP TABLE ehr_lookups.urinalysis_method;


--virology_source
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('virology_source', 'Virology Source Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'virology_source';
INSERT INTO ehr_lookups.lookups (set_name, value, title, description, sort_order)
SELECT
   'virology_source' as set_name,
   source as value,
   null as title,
   null as description,
   null as sort_order
FROM ehr_lookups.virology_source;

DROP TABLE ehr_lookups.virology_source;


--obs_behavior
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField, titleColumn)
VALUES ('obs_behavior', 'Obs Behavior Field Values', 'value', 'title');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'obs_behavior';
INSERT INTO ehr_lookups.lookups (set_name, value, title)
SELECT
   'obs_behavior' as set_name,
   code as value,
   meaning as title
FROM ehr_lookups.obs_behavior;

DROP TABLE ehr_lookups.obs_behavior;


--obs_breeding
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField, titleColumn)
VALUES ('obs_breeding', 'Obs Breeding Field Values', 'value', 'title');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'obs_breeding';
INSERT INTO ehr_lookups.lookups (set_name, value, title)
SELECT
   'obs_breeding' as set_name,
   code as value,
   meaning as title
FROM ehr_lookups.obs_breeding;

DROP TABLE ehr_lookups.obs_breeding;


--obs_other
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField, titleColumn)
VALUES ('obs_other', 'Obs Other Field Values', 'value', 'title');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'obs_other';
INSERT INTO ehr_lookups.lookups (set_name, value, title)
SELECT
   'obs_other' as set_name,
   code as value,
   meaning as title
FROM ehr_lookups.obs_other;

DROP TABLE ehr_lookups.obs_other;


--dental_teeth
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('dental_teeth', 'Dental Teeth Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'dental_teeth';
INSERT INTO ehr_lookups.lookups (set_name, value, description, sort_order)
SELECT
   'dental_teeth' as set_name,
   teeth as value,
   null as description,
   seq_order as sort_order
FROM ehr_lookups.dental_teeth;

DROP TABLE ehr_lookups.dental_teeth;


--dental_priority
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('dental_priority', 'Dental Priority Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'dental_priority';
INSERT INTO ehr_lookups.lookups (set_name, value, description, sort_order)
SELECT
   'dental_priority' as set_name,
   priority as value,
   criteria as description,
   sort_order
FROM ehr_lookups.dental_priority;

DROP TABLE ehr_lookups.dental_priority;


--pe_region
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('pe_region', 'PE Region Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'pe_region';
INSERT INTO ehr_lookups.lookups (set_name, value, description, sort_order)
SELECT
   'pe_region' as set_name,
   region as value,
   null as description,
   null as sort_order
FROM ehr_lookups.pe_region;

DROP TABLE ehr_lookups.pe_region;


--obs_tlocation
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('obs_tlocation', 'Obs Trauma Location Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'obs_tlocation';
INSERT INTO ehr_lookups.lookups (set_name, value, sort_order)
SELECT
   'obs_tlocation' as set_name,
   location as value,
   sort_order
FROM ehr_lookups.obs_tlocation;

DROP TABLE ehr_lookups.obs_tlocation;


--bcs_score
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField, titleColumn)
VALUES ('bcs_score', 'BCS Store Field Values', 'value', 'title');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'bcs_score';
INSERT INTO ehr_lookups.lookups (set_name, value, title, description)
SELECT
   'bcs_score' as set_name,
   score as value,
   meaning as title,
   description
FROM ehr_lookups.bcs_score;

DROP TABLE ehr_lookups.bcs_score;


--obs_remarks
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField)
VALUES ('obs_remarks', 'Obs Remarks Field Values', 'value');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'obs_remarks';
INSERT INTO ehr_lookups.lookups (set_name, value, description)
SELECT
   'obs_remarks' as set_name,
   title as value,
   remark as description
FROM ehr_lookups.obs_remarks;

DROP TABLE ehr_lookups.obs_remarks;


--condition_codes
INSERT INTO ehr_lookups.lookup_sets (setname, label, keyField, titleColumn)
VALUES ('housing_condition_codes', 'Housing Condition Code Field Values', 'value', 'title');

DELETE FROM ehr_lookups.lookups WHERE set_name = 'housing_condition_codes';
INSERT INTO ehr_lookups.lookups (set_name, value, title)
SELECT
   'housing_condition_codes' as set_name,
   code as value,
   meaning as title
FROM ehr_lookups.condition_codes;

DROP TABLE ehr_lookups.condition_codes;
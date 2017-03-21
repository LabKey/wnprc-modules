DROP TABLE IF EXISTS wnprc_compliance.protocols;
CREATE TABLE wnprc_compliance.protocols (
  id TEXT,
  protocol_number TEXT UNIQUE NOT NULL,

  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_protocol PRIMARY KEY (id)
);

DROP TABLE IF EXISTS wnprc_compliance.protocol_revisions;
CREATE TABLE wnprc_compliance.protocol_revisions (
  id TEXT,

  protocol_id TEXT,

  principal_investigator_id TEXT NOT NULL,
  spi_primary_id            TEXT NOT NULL,
  spi_secondary_id          TEXT NOT NULL,
  approval_date             TIMESTAMP,
  attached_file_id          TEXT,
  usda_designation          TEXT NOT NULL,

  has_biological_hazards  BOOLEAN NOT NULL DEFAULT FALSE,
  has_chemical_hazards    BOOLEAN NOT NULL DEFAULT FALSE,
  has_physical_hazards    BOOLEAN NOT NULL DEFAULT FALSE,
  has_radiation_hazards   BOOLEAN NOT NULL DEFAULT FALSE,
  has_wildlife_hazards    BOOLEAN NOT NULL DEFAULT FALSE,
  has_other_hazards       BOOLEAN NOT NULL DEFAULT FALSE,
  other_hazards_notes     TEXT,
  has_recombinant_material_hazards   BOOLEAN,

  involves_euthanasia BOOLEAN NOT NULL DEFAULT FALSE,
  allows_single_housing BOOLEAN NOT NULL DEFAULT FALSE,

  -- Default fields for LabKey.
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_protocol_revisions PRIMARY KEY (id),
  CONSTRAINT FK_protocol_revisions_pi_persons   FOREIGN KEY (principal_investigator_id) REFERENCES wnprc_compliance.persons (personid),
  CONSTRAINT FK_protocol_revisions_spi1_persons FOREIGN KEY (principal_investigator_id) REFERENCES wnprc_compliance.persons (personid),
  CONSTRAINT FK_protocol_revisions_spi2_persons FOREIGN KEY (principal_investigator_id) REFERENCES wnprc_compliance.persons (personid),
  CONSTRAINT FK_protocol_revisions_protocols    FOREIGN KEY (protocol_id) REFERENCES wnprc_compliance.protocols (id)
);

DROP TABLE IF EXISTS wnprc_compliance.protocol_renewals;
CREATE TABLE wnprc_compliance.protocol_renewals (
  expired_protocol TEXT,
  renewed_protocol TEXT,

  -- Default fields for LabKey.
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_protocol_renewals PRIMARY KEY (renewed_protocol)
);

DROP TABLE IF EXISTS wnprc_compliance.allowed_species;
CREATE TABLE wnprc_compliance.allowed_species (
  protocol_revision_id TEXT,
  species_classifier TEXT,

  max_number_of_animals INTEGER NOT NULL,

  -- Default fields for LabKey.
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_allowed_species PRIMARY KEY (protocol_revision_id, species_classifier),
  CONSTRAINT FK_allowed_species FOREIGN KEY (protocol_revision_id) REFERENCES wnprc_compliance.protocol_revisions (id)
);

DROP TABLE IF EXISTS wnprc_compliance.drug_regimens;
CREATE TABLE wnprc_compliance.drug_regimens (
  id TEXT,

  regimen_name TEXT NOT NULL,
  frequency_description TEXT,
  substance_type TEXT NOT NULL,

  -- Default fields for LabKey.
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_drug_regimens PRIMARY KEY (id)
);

DROP TABLE IF EXISTS wnprc_compliance.drug_regimens_to_allowed_procedures;
CREATE TABLE wnprc_compliance.drug_regimens_to_allowed_procedures (
  protocol_revision_id TEXT,
  species_classifier TEXT,
  drug_regimen_id TEXT,

  -- Default fields for LabKey.
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_drug_regimens_to_protocols PRIMARY KEY (protocol_revision_id, drug_regimen_id),
  CONSTRAINT FK_drug_regimens_to_protocols_allowed_species FOREIGN KEY (protocol_revision_id, species_classifier) REFERENCES wnprc_compliance.allowed_species (protocol_revision_id, species_classifier),
  CONSTRAINT FK_drug_regimens_to_protocols_drug_regimens FOREIGN KEY (drug_regimen_id) REFERENCES wnprc_compliance.drug_regimens (id)
);

DROP TABLE IF EXISTS wnprc_compliance.drugs;
CREATE TABLE wnprc_compliance.drugs (
  id TEXT,

  snomed_code TEXT NOT NULL,
  dose_amount FLOAT,
  dose_units TEXT,
  frequency_description TEXT,
  substance_type TEXT NOT NULL,

  -- Default fields for LabKey.
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_drugs PRIMARY KEY (id)
);

DROP TABLE IF EXISTS wnprc_compliance.drug_regimens_to_drugs;
CREATE TABLE wnprc_compliance.drug_regimens_to_drugs (
  drug_regimen TEXT,
  drug_id TEXT,

  -- Default fields for LabKey.
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_drug_regimens_to_drugs PRIMARY KEY (drug_id, drug_regimen),
  CONSTRAINT FK_drug_regimens_to_drugs_regimens FOREIGN KEY (drug_regimen) REFERENCES wnprc_compliance.drug_regimens (id),
  CONSTRAINT FK_drug_regimens_to_drugs_drugs FOREIGN KEY (drug_id) REFERENCES wnprc_compliance.drugs (id)
);

DROP TABLE IF EXISTS wnprc_compliance.drug_routes;
CREATE TABLE wnprc_compliance.drug_routes (
  drug_id TEXT,
  route TEXT NOT NULL,

  -- Default fields for LabKey.
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_drug_routes PRIMARY KEY (drug_id, route),
  CONSTRAINT FK_drug_routes_to_drugs FOREIGN KEY (drug_id) REFERENCES wnprc_compliance.drugs (id)
);

-- no more frequently than...
DROP TABLE IF EXISTS wnprc_compliance.drug_regimen_frequency_threshold;
CREATE TABLE wnprc_compliance.drug_regimen_frequency_threshold (
  id TEXT,

  timeperiod INTEGER NOT NULL,
  time_unit  TEXT NOT NULL,
  type TEXT NOT NULL,

  -- Default fields for LabKey.
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_drug_regimen_frequency_threshold PRIMARY KEY (id)
);

DROP TABLE IF EXISTS wnprc_compliance.drug_regimens_to_frequency_threshold;
CREATE TABLE wnprc_compliance.drug_regimens_to_frequency_threshold (
  drug_regimen_id TEXT,
  threshold_id TEXT,

  -- Default fields for LabKey.
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_drug_regimens_to_frequency_threshold PRIMARY KEY (drug_regimen_id, threshold_id),
  CONSTRAINT FK_drug_regimens_to_frequency_threshold_drug_regimens FOREIGN KEY (drug_regimen_id) REFERENCES wnprc_compliance.drug_regimens (id),
  CONSTRAINT FK_drug_regimens_to_frequency_threshold_thresholds FOREIGN KEY (threshold_id) REFERENCES wnprc_compliance.drug_regimen_frequency_threshold (id)
);

DROP TABLE IF EXISTS wnprc_compliance.allowed_procedures;
CREATE TABLE wnprc_compliance.allowed_procedures (
  id TEXT,

  snomed_code TEXT NOT NULL,
  display_title TEXT,
  description TEXT,
  max_no_animals INTEGER,
  sop_id TEXT,

  -- Default fields for LabKey.
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_allowed_procedures PRIMARY KEY (id)
);

DROP TABLE IF EXISTS wnprc_compliance.allowed_species_to_allowed_procedures;
CREATE TABLE wnprc_compliance.allowed_species_to_allowed_procedures (
  protocol_revision_id TEXT,
  species_classifier TEXT,
  allowed_procedure_id TEXT,

  -- Default fields for LabKey.
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_allowed_species_to_allowed_procedures PRIMARY KEY (protocol_revision_id, species_classifier, allowed_procedure_id),
  CONSTRAINT FK_allowed_species_to_allowed_procedures_allowed_species FOREIGN KEY (protocol_revision_id, species_classifier) REFERENCES wnprc_compliance.allowed_species (protocol_revision_id, species_classifier),
  CONSTRAINT FK_allowed_species_to_allowed_procedures_allowed_procedures FOREIGN KEY (allowed_procedure_id) REFERENCES wnprc_compliance.allowed_procedures (id)
);

DROP TABLE IF EXISTS wnprc_compliance.allowed_procedures_to_drug_regimens;
CREATE TABLE wnprc_compliance.allowed_procedures_to_drug_regimens (
  allowed_procedure_id TEXT,
  drug_regimen_id TEXT,

  -- Default fields for LabKey.
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_allowed_procedures_to_drug_regimens PRIMARY KEY (allowed_procedure_id, drug_regimen_id),
  CONSTRAINT FK_allowed_procedures_to_drug_regimens_allowed_procedures FOREIGN KEY (allowed_procedure_id) REFERENCES wnprc_compliance.allowed_procedures (id),
  CONSTRAINT FK_allowed_procedures_to_drug_regimens_drug_regimens FOREIGN KEY (drug_regimen_id) REFERENCES wnprc_compliance.drug_regimens (id)
);

DROP TABLE IF EXISTS wnprc_compliance.allowed_surgeries;
CREATE TABLE wnprc_compliance.allowed_surgeries (
  surgery_id TEXT,

  title TEXT NOT NULL,
  description TEXT,
  survival_type TEXT NOT NULL,
  estimated_duration_in_minutes INTEGER NOT NULL,
  min_fast_hours INTEGER,
  max_fast_hours INTEGER,

  -- Default fields for LabKey.
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_surgery_info PRIMARY KEY (surgery_id)
);

DROP TABLE IF EXISTS wnprc_compliance.allowed_surgeries_to_drug_regimens;
CREATE TABLE wnprc_compliance.allowed_surgeries_to_drug_regimens (
  surgery_id TEXT,
  drug_regimen_id TEXT,

  -- Default fields for LabKey.
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_allowed_surgeries_to_drug_regimens PRIMARY KEY (surgery_id, drug_regimen_id),
  CONSTRAINT FK_allowed_surgeries_to_drug_regimens_surgeries FOREIGN KEY (surgery_id) REFERENCES wnprc_compliance.allowed_surgeries (surgery_id),
  CONSTRAINT FK_allowed_surgeries_to_drug_regimens_regimens FOREIGN KEY (drug_regimen_id) REFERENCES wnprc_compliance.drug_regimens (id)
);
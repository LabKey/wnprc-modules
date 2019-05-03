DROP TABLE IF EXISTS wnprc.gestational_days;
CREATE TABLE wnprc.gestational_days (
  rowid serial NOT NULL,
  species VARCHAR(50),
  gestational_day INTEGER,
  gest_sac_mm FLOAT8,
  crown_rump_mm FLOAT8,
  biparietal_diameter_mm FLOAT8,
  femur_length_mm FLOAT8,

  -- Default fields for LabKey.
  Container ENTITYID NOT NULL,
  CreatedBy USERID,
  Created TIMESTAMP,
  ModifiedBy USERID,
  Modified TIMESTAMP,

  CONSTRAINT PK_species PRIMARY KEY (species, gestational_day)
);
DROP TABLE IF EXISTS wnprc.gestational_days;
CREATE TABLE wnprc.gestational_days (
  species VARCHAR(50),
  gestational_day INTEGER,
  beats_per_minute INTEGER,
  crown_rump_mm FLOAT8,
  head_circumference_mm FLOAT8,
  femur_length_mm FLOAT8,
  biparietal_diameter_mm FLOAT8,

  -- Default fields for LabKey.
  Container ENTITYID NOT NULL,
  CreatedBy USERID,
  Created TIMESTAMP,
  ModifiedBy USERID,
  Modified TIMESTAMP,

  CONSTRAINT PK_species PRIMARY KEY (species)
);
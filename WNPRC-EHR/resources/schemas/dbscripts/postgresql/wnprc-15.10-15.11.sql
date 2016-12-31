DROP TABLE IF EXISTS wnprc.necropsy_suite;
CREATE TABLE wnprc.necropsy_suite (
  room TEXT,

  disabled_on   TIMESTAMP,
  display_color TEXT,

  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT pk_necropsy_suite PRIMARY KEY (room, container),
  CONSTRAINT fk_necropsy_suite_rooms FOREIGN KEY (room) REFERENCES ehr_lookups.rooms (room)
);
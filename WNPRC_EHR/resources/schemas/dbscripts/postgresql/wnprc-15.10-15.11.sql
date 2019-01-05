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

  --adding 'container' to below constraint to avoid teamcity failure/for users using bootstrapped db: org.postgresql.util.PSQLException: ERROR: there is no unique constraint matching given keys for referenced table "rooms"
  --this error is caused by 'room' no longer being a PK/unique in ehr_lookups.rooms as of ehr_lookups-18.11-18.12. This constraint will get dropped and re-added in wnprc-18.30-18.31.sql for production or staging server/non-bootstrapped db to take effect.
  CONSTRAINT fk_necropsy_suite_rooms FOREIGN KEY (container, room) REFERENCES ehr_lookups.rooms (container, room)
);
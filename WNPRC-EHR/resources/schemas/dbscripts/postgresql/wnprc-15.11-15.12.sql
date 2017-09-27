-- Add a display name to the necropsy suite to display on the schedule.
ALTER TABLE wnprc.necropsy_suite
ADD COLUMN displayName TEXT
;

-- Add a table to allow connections to external email accounts
DROP TABLE IF EXISTS wnprc.email_server;
CREATE TABLE wnprc.email_server (
  id TEXT,

  hostname     TEXT,
  protocol     TEXT DEFAULT 'pop3',
  port         INTEGER,
  display_name TEXT,
  use_ssl      BOOLEAN DEFAULT TRUE,

  -- Some other tracking info
  disabled_on   TIMESTAMP,

  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT pk_email_server PRIMARY KEY (id, container)
);
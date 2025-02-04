ALTER TABLE wnprc_compliance.card_info ADD COLUMN IF NOT EXISTS card_type text;
ALTER TABLE wnprc_compliance.card_info ADD COLUMN IF NOT EXISTS date_issued timestamp;
ALTER TABLE wnprc_compliance.card_info ADD COLUMN IF NOT EXISTS date_expire timestamp;
ALTER TABLE wnprc_compliance.card_info ADD COLUMN IF NOT EXISTS issue_code int;

ALTER TABLE wnprc_compliance.access_report_data RENAME TO access_report_data_old;


DROP TABLE IF EXISTS wnprc_compliance.access_report_data;
CREATE TABLE wnprc_compliance.access_report_data (
  report_id TEXT,
  access_level TEXT,
  card_id TEXT,

  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_access_report_data_new PRIMARY KEY (report_id, access_level, card_id),
  CONSTRAINT FK_access_report_data_access_reports_new FOREIGN KEY (report_id) REFERENCES wnprc_compliance.access_reports (report_id)
);

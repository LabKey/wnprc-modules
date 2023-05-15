
-- OCONNOR fixes
ALTER TABLE oconnor.inventory ADD COLUMN IF NOT EXISTS ModifiedBy USERID;
ALTER TABLE oconnor.inventory ADD COLUMN IF NOT EXISTS CreatedBy USERID;
ALTER TABLE oconnor.inventory_removed ADD COLUMN IF NOT EXISTS ModifiedBy USERID;
ALTER TABLE oconnor.inventory_removed ADD COLUMN IF NOT EXISTS CreatedBy USERID;

-- EHR fixes
ALTER TABLE ehr.protocolprocedures ADD COLUMN IF NOT EXISTS remark TEXT;

-- Orphaned dataset storage table
DROP TABLE IF EXISTS studydataset.c108d1598_cageobs;
ALTER TABLE wnprc_compliance.measles_clearances ADD COLUMN IF NOT EXISTS required BOOLEAN DEFAULT true;

ALTER TABLE wnprc_compliance.persons ADD COLUMN IF NOT EXISTS hold BOOLEAN DEFAULT false;
--update measles_required from wnprc_compliance.measles_clearances using labkey javascript API
ALTER TABLE wnprc_compliance.persons ADD COLUMN IF NOT EXISTS measles_required BOOLEAN DEFAULT false;

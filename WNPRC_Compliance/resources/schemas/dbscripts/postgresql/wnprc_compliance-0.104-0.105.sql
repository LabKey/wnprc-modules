ALTER TABLE wnprc_compliance.persons ADD COLUMN hold BOOLEAN DEFAULT false;
ALTER TABLE wnprc_compliance.persons ADD COLUMN barrier_access_requested BOOLEAN DEFAULT false;
/*update measles_required from wnprc_compliance.measles_clearances using labkey javascript API*/



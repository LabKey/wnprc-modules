--Modifying wnprc.animal_requests table by renaming pi column and adding constraint 
ALTER TABLE IF EXISTS wnprc.animal_requests RENAME COLUMN principalinvestigator TO principalinvestigatorold;
ALTER TABLE IF EXISTS wnprc.animal_requests ALTER COLUMN principalinvestigatorold DROP NOT NULL;
ALTER TABLE IF EXISTS wnprc.animal_requests ADD COLUMN principalinvestigator INTEGER;
ALTER TABLE IF EXISTS wnprc.animal_requests ADD CONSTRAINT FK_WNPRC_ANIMAL_REQUESTS_EHR_INVESTIGATORS_ROWID FOREIGN KEY (principalinvestigator) REFERENCES ehr.investigators (rowid);

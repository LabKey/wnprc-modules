/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE FUNCTION ehr.handleUpgrade() RETURNS VOID AS $$
DECLARE
    BEGIN
      IF NOT EXISTS (
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='protocolprocedures' and table_schema='ehr' and column_name='remark'
      )
      THEN
        -- Run variants of scripts from onprc14.2 branch
        ALTER TABLE ehr.protocolprocedures add remark TEXT;
      END IF;
    END;
$$ LANGUAGE plpgsql;

SELECT ehr.handleUpgrade();

DROP FUNCTION ehr.handleUpgrade();

SELECT core.fn_dropifexists('treatment_times', 'ehr', 'Index', 'IDX_treatment_times_treatmentid');

CREATE INDEX IDX_treatment_times_treatmentid ON ehr.treatment_times (treatmentid);

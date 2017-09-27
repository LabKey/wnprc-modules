/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE PROCEDURE ehr.handleUpgrade AS
    BEGIN
    IF NOT EXISTS(SELECT column_name
            FROM information_schema.columns
            WHERE table_name='protocolprocedures' and table_schema='ehr' and column_name='remark')
        BEGIN
        -- Run variants of scripts from onprc14.2 branch
        ALTER TABLE [ehr].[protocolprocedures] add remark varchar(max);
        END
    END;
GO

EXEC ehr.handleUpgrade
GO

DROP PROCEDURE ehr.handleUpgrade
GO

EXEC core.fn_dropifexists 'treatment_times', 'ehr', 'Index', 'IDX_treatment_times_treatmentid';

CREATE INDEX IDX_treatment_times_treatmentid ON ehr.treatment_times (treatmentid);

/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.blood_draw_services add formtype varchar(100);
ALTER TABLE ehr_lookups.blood_draw_services add labwork_service varchar(100);
GO
UPDATE ehr_lookups.blood_draw_services SET formtype = 'Clinpath Request';
UPDATE ehr_lookups.blood_draw_services SET labwork_service = service;
